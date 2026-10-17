package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/config"
	"uisace-backend/internal/models"
)

type FormHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewFormHandler(db *gorm.DB, cfg *config.Config) *FormHandler {
	return &FormHandler{
		db:  db,
		cfg: cfg,
	}
}

// GetPublicForms lists active and public forms
func (h *FormHandler) GetPublicForms(c *gin.Context) {
	formType := c.Query("type")

	query := h.db.Model(&models.PorslineForm{}).Where("status = ? AND is_public = ?", "active", true)
	if formType != "" && formType != "all" {
		query = query.Where("type = ?", formType)
	}

	var forms []models.PorslineForm
	if err := query.Order("created_at DESC").Find(&forms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست پرسشنامه‌ها"})
		return
	}

	// Sanitize questions to remove correct answers from public list
	for i := range forms {
		for j := range forms[i].Questions {
			forms[i].Questions[j].CorrectAnswer = ""
		}
	}

	c.JSON(http.StatusOK, forms)
}

// GetFormByIDOrSlug gets a form for public viewing/filling
func (h *FormHandler) GetFormByIDOrSlug(c *gin.Context) {
	identifier := c.Param("id")

	var form models.PorslineForm
	id, err := strconv.Atoi(identifier)
	if err == nil {
		if err := h.db.First(&form, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "پرسشنامه یا فرم مورد نظر یافت نشد"})
			return
		}
	} else {
		if err := h.db.Where("slug = ?", identifier).First(&form).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "پرسشنامه یا فرم مورد نظر یافت نشد"})
			return
		}
	}

	if form.Status != "active" {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "این پرسشنامه در حال حاضر غیرفعال یا پایان‌یافته است",
			"status":  form.Status,
			"title":   form.Title,
		})
		return
	}

	// Remove correct answers from public view to prevent cheating
	sanitizedQuestions := make([]models.FormQuestion, len(form.Questions))
	copy(sanitizedQuestions, form.Questions)
	for i := range sanitizedQuestions {
		sanitizedQuestions[i].CorrectAnswer = ""
	}
	form.Questions = sanitizedQuestions

	c.JSON(http.StatusOK, form)
}

// SubmitForm handles respondent form submissions
func (h *FormHandler) SubmitForm(c *gin.Context) {
	identifier := c.Param("id")

	var form models.PorslineForm
	id, err := strconv.Atoi(identifier)
	if err == nil {
		if err := h.db.First(&form, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "پرسشنامه مورد نظر یافت نشد"})
			return
		}
	} else {
		if err := h.db.Where("slug = ?", identifier).First(&form).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "پرسشنامه مورد نظر یافت نشد"})
			return
		}
	}

	if form.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "مهلت ثبت پاسخ در این پرسشنامه به پایان رسیده است"})
		return
	}

	var req struct {
		RespondentName    string                 `json:"respondentName"`
		RespondentContact string                 `json:"respondentContact"`
		Answers           map[string]interface{} `json:"answers" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است"})
		return
	}

	// Validate required questions
	for _, q := range form.Questions {
		if q.Required {
			val, exists := req.Answers[q.ID]
			if !exists || val == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("پاسخ به سوال «%s» الزامی است", q.Title)})
				return
			}
			strVal, isStr := val.(string)
			if isStr && strings.TrimSpace(strVal) == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("پاسخ به سوال «%s» الزامی است", q.Title)})
				return
			}
			arrVal, isArr := val.([]interface{})
			if isArr && len(arrVal) == 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("پاسخ به سوال «%s» الزامی است", q.Title)})
				return
			}
		}
	}

	// Calculate score if quiz type
	var score *int
	var maxScore *int
	if form.Type == "quiz" {
		totalScore := 0
		totalMax := 0
		for _, q := range form.Questions {
			pts := q.Points
			if pts <= 0 {
				pts = 1
			}
			totalMax += pts

			if q.CorrectAnswer != "" {
				userAns, ok := req.Answers[q.ID]
				if ok && userAns != nil {
					userAnsStr := fmt.Sprintf("%v", userAns)
					if strings.TrimSpace(strings.ToLower(userAnsStr)) == strings.TrimSpace(strings.ToLower(q.CorrectAnswer)) {
						totalScore += pts
					}
				}
			}
		}
		score = &totalScore
		maxScore = &totalMax
	}

	resp := models.FormResponse{
		FormID:            form.ID,
		RespondentName:    strings.TrimSpace(req.RespondentName),
		RespondentContact: strings.TrimSpace(req.RespondentContact),
		Answers:           req.Answers,
		Score:             score,
		MaxScore:          maxScore,
		IP:                c.ClientIP(),
	}

	if err := h.db.Create(&resp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ثبت پاسخ"})
		return
	}

	// Increment response count
	h.db.Model(&form).UpdateColumn("response_count", gorm.Expr("response_count + 1"))

	successMsg := form.SuccessMessage
	if successMsg == "" {
		successMsg = "پاسخ شما با موفقیت ثبت شد. با تشکر از مشارکت شما!"
	}

	c.JSON(http.StatusCreated, gin.H{
		"success":        true,
		"message":        successMsg,
		"responseId":     resp.ID,
		"score":          score,
		"maxScore":       maxScore,
		"type":           form.Type,
	})
}

// UploadAttachment uploads a file attached to a form answer
func (h *FormHandler) UploadAttachment(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "فایل ارسالی یافت نشد"})
		return
	}

	targetDir := filepath.Join(h.cfg.UploadDir, "form_attachments")
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد مسیر ذخیره فایل"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	filename := fmt.Sprintf("attachment_%d%s", time.Now().UnixNano(), ext)
	dst := filepath.Join(targetDir, filename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره فایل"})
		return
	}

	url := "/uploads/form_attachments/" + filename
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"url":      url,
		"filename": filename,
	})
}

// --- Admin Endpoints ---

// GetAdminForms lists all forms for admin
func (h *FormHandler) GetAdminForms(c *gin.Context) {
	status := c.Query("status")
	formType := c.Query("type")
	search := c.Query("search")

	query := h.db.Model(&models.PorslineForm{})

	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if formType != "" && formType != "all" {
		query = query.Where("type = ?", formType)
	}

	if search != "" {
		pattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", pattern, pattern)
	}

	var forms []models.PorslineForm
	if err := query.Order("created_at DESC").Find(&forms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست فرم‌ها"})
		return
	}

	// Update response counts dynamically
	for i := range forms {
		var cnt int64
		h.db.Model(&models.FormResponse{}).Where("form_id = ?", forms[i].ID).Count(&cnt)
		forms[i].ResponseCount = int(cnt)
	}

	c.JSON(http.StatusOK, forms)
}

// GetAdminFormByID gets full form including correct answers for admin
func (h *FormHandler) GetAdminFormByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه فرم نامعتبر است"})
		return
	}

	var form models.PorslineForm
	if err := h.db.First(&form, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "فرم مورد نظر یافت نشد"})
		return
	}

	var count int64
	h.db.Model(&models.FormResponse{}).Where("form_id = ?", form.ID).Count(&count)
	form.ResponseCount = int(count)

	c.JSON(http.StatusOK, form)
}

// CreateForm creates a new Porsline form
func (h *FormHandler) CreateForm(c *gin.Context) {
	var form models.PorslineForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	if strings.TrimSpace(form.Title) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "عنوان فرم الزامی است"})
		return
	}

	if form.Type == "" {
		form.Type = "survey"
	}
	if form.Status == "" {
		form.Status = "active"
	}

	// Ensure unique/clean slug
	if strings.TrimSpace(form.Slug) == "" {
		form.Slug = fmt.Sprintf("form-%d", time.Now().Unix())
	} else {
		form.Slug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(form.Slug), " ", "-"))
	}

	// Ensure question IDs exist and order is set
	for i := range form.Questions {
		if form.Questions[i].ID == "" {
			form.Questions[i].ID = fmt.Sprintf("q_%d_%d", time.Now().UnixNano(), i+1)
		}
		if form.Questions[i].Order == 0 {
			form.Questions[i].Order = i + 1
		}
	}

	if err := h.db.Create(&form).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد فرم جدید"})
		return
	}

	c.JSON(http.StatusCreated, form)
}

// UpdateForm updates an existing Porsline form
func (h *FormHandler) UpdateForm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه فرم نامعتبر است"})
		return
	}

	var existing models.PorslineForm
	if err := h.db.First(&existing, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "فرم مورد نظر یافت نشد"})
		return
	}

	var updateData models.PorslineForm
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	if strings.TrimSpace(updateData.Title) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "عنوان فرم الزامی است"})
		return
	}

	// Ensure question IDs exist
	for i := range updateData.Questions {
		if updateData.Questions[i].ID == "" {
			updateData.Questions[i].ID = fmt.Sprintf("q_%d_%d", time.Now().UnixNano(), i+1)
		}
		if updateData.Questions[i].Order == 0 {
			updateData.Questions[i].Order = i + 1
		}
	}

	updateData.ID = uint(id)
	updateData.CreatedAt = existing.CreatedAt

	if err := h.db.Save(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره تغییرات فرم"})
		return
	}

	c.JSON(http.StatusOK, updateData)
}

// DeleteForm deletes a form and its responses
func (h *FormHandler) DeleteForm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه فرم نامعتبر است"})
		return
	}

	// Delete responses first
	h.db.Where("form_id = ?", id).Delete(&models.FormResponse{})

	if err := h.db.Delete(&models.PorslineForm{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف فرم"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "فرم و تمامی پاسخ‌های آن با موفقیت حذف شدند"})
}

// FormAnalytics represents analytical summaries for a form
type FormAnalytics struct {
	TotalResponses int                             `json:"totalResponses"`
	AverageScore   *float64                        `json:"averageScore,omitempty"`
	QuestionStats  map[string]map[string]int       `json:"questionStats"` // questionId -> optionText -> count
}

// GetFormResponses gets all responses for a form along with aggregated stats
func (h *FormHandler) GetFormResponses(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه فرم نامعتبر است"})
		return
	}

	var form models.PorslineForm
	if err := h.db.First(&form, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "فرم مورد نظر یافت نشد"})
		return
	}

	var responses []models.FormResponse
	if err := h.db.Where("form_id = ?", id).Order("created_at DESC").Find(&responses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت پاسخ‌ها"})
		return
	}

	// Aggregate statistics
	analytics := FormAnalytics{
		TotalResponses: len(responses),
		QuestionStats:  make(map[string]map[string]int),
	}

	// Initialize option maps for choice questions
	for _, q := range form.Questions {
		if q.Type == "radio" || q.Type == "checkbox" || q.Type == "select" || q.Type == "boolean" || q.Type == "rating" {
			analytics.QuestionStats[q.ID] = make(map[string]int)
			for _, opt := range q.Options {
				analytics.QuestionStats[q.ID][opt] = 0
			}
		}
	}

	var scoreSum int
	var scoreCount int

	for _, r := range responses {
		if r.Score != nil {
			scoreSum += *r.Score
			scoreCount++
		}

		for qID, ansVal := range r.Answers {
			if statsMap, ok := analytics.QuestionStats[qID]; ok {
				if strVal, ok := ansVal.(string); ok {
					statsMap[strVal]++
				} else if arrVal, ok := ansVal.([]interface{}); ok {
					for _, item := range arrVal {
						if itemStr, ok := item.(string); ok {
							statsMap[itemStr]++
						}
					}
				} else if boolVal, ok := ansVal.(bool); ok {
					if boolVal {
						statsMap["بله"]++
					} else {
						statsMap["خیر"]++
					}
				} else if numVal, ok := ansVal.(float64); ok {
					statsMap[fmt.Sprintf("%.0f", numVal)]++
				}
			}
		}
	}

	if scoreCount > 0 {
		avg := float64(scoreSum) / float64(scoreCount)
		analytics.AverageScore = &avg
	}

	c.JSON(http.StatusOK, gin.H{
		"form":      form,
		"responses": responses,
		"analytics": analytics,
	})
}

// DeleteFormResponse deletes a single response
func (h *FormHandler) DeleteFormResponse(c *gin.Context) {
	idStr := c.Param("responseId")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه پاسخ نامعتبر است"})
		return
	}

	var resp models.FormResponse
	if err := h.db.First(&resp, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "پاسخ مورد نظر یافت نشد"})
		return
	}

	formID := resp.FormID
	if err := h.db.Delete(&resp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف پاسخ"})
		return
	}

	// Decrement count
	h.db.Model(&models.PorslineForm{}).Where("id = ? AND response_count > 0", formID).
		UpdateColumn("response_count", gorm.Expr("response_count - 1"))

	c.JSON(http.StatusOK, gin.H{"message": "پاسخ با موفقیت حذف شد"})
}
