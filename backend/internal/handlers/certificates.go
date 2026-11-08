package handlers

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type CertificateHandler struct {
	db *gorm.DB
}

func NewCertificateHandler(db *gorm.DB) *CertificateHandler {
	return &CertificateHandler{db: db}
}

// generateCertID generates an authentic format ID like: CERT-UI-84920
func generateCertID() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(90000))
	return fmt.Sprintf("CERT-UI-%d", 10000+n.Int64())
}

// VerifyCertificate searches for certificates by query (Code, National ID, or Student Number)
func (h *CertificateHandler) VerifyCertificate(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "لطفاً کد گواهی، کد ملی یا شماره دانشجویی را وارد کنید"})
		return
	}

	var certs []models.Certificate
	err := h.db.Where("id = ? OR national_id = ? OR student_number = ?", q, q, q).
		Order("created_at DESC").
		Find(&certs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در استعلام اصالت گواهینامه"})
		return
	}

	if len(certs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "هیچ گواهینامه‌ای با مشخصات وارد شده یافت نشد"})
		return
	}

	c.JSON(http.StatusOK, certs)
}

// GetCertificateByID returns a single certificate by its code
func (h *CertificateHandler) GetCertificateByID(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	var cert models.Certificate
	if err := h.db.First(&cert, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "گواهینامه مورد نظر یافت نشد یا ابطال شده است"})
		return
	}

	c.JSON(http.StatusOK, cert)
}

// GetAdminCertificates returns list of all certificates for admin
func (h *CertificateHandler) GetAdminCertificates(c *gin.Context) {
	search := strings.TrimSpace(c.Query("search"))
	program := strings.TrimSpace(c.Query("program"))

	query := h.db.Model(&models.Certificate{})
	if search != "" {
		pattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(id) LIKE ? OR LOWER(student_name) LIKE ? OR national_id LIKE ? OR student_number LIKE ?", pattern, pattern, pattern, pattern)
	}
	if program != "" {
		query = query.Where("program_title = ?", program)
	}

	var certs []models.Certificate
	if err := query.Order("created_at DESC").Find(&certs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست گواهینامه‌ها"})
		return
	}

	c.JSON(http.StatusOK, certs)
}

// CreateCertificate issues a single new certificate
func (h *CertificateHandler) CreateCertificate(c *gin.Context) {
	var input models.Certificate
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	input.StudentName = strings.TrimSpace(input.StudentName)
	input.ProgramTitle = strings.TrimSpace(input.ProgramTitle)
	if input.StudentName == "" || input.ProgramTitle == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "نام دانشجو و عنوان رویداد الزامی است"})
		return
	}

	if input.ID == "" {
		input.ID = generateCertID()
	}
	if input.IssueDate == "" {
		input.IssueDate = time.Now().Format("2006-01-02")
	}
	if input.Status == "" {
		input.Status = "valid"
	}
	if input.AssociationHead == "" {
		input.AssociationHead = "دبیر انجمن علمی مهندسی کامپیوتر"
	}

	if input.TitlePrefix == "" {
		if input.Gender == "male" || input.Gender == "مرد" || input.Gender == "آقا" {
			input.TitlePrefix = "جناب آقای"
			input.Gender = "male"
		} else if input.Gender == "female" || input.Gender == "زن" || input.Gender == "خانم" {
			input.TitlePrefix = "سرکار خانم"
			input.Gender = "female"
		}
	}

	now := time.Now()
	input.CreatedAt = now
	input.UpdatedAt = now

	if err := h.db.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در صدور گواهینامه: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

type BatchItem struct {
	StudentName   string `json:"studentName"`
	Gender        string `json:"gender"`
	TitlePrefix   string `json:"titlePrefix"`
	NationalID    string `json:"nationalId"`
	StudentNumber string `json:"studentNumber"`
	Grade         string `json:"grade"`
	CustomText    string `json:"customText"`
}

type BatchCertificateRequest struct {
	ProgramTitle    string      `json:"programTitle"`
	ProgramDate     string      `json:"programDate"`
	DurationHours   int         `json:"durationHours"`
	Instructor      string      `json:"instructor"`
	AssociationHead string      `json:"associationHead"`
	IssueDate       string      `json:"issueDate"`
	CustomText      string      `json:"customText"`
	Items           []BatchItem `json:"items"`
}

// BatchCreateCertificates issues certificates for multiple students at once
func (h *CertificateHandler) BatchCreateCertificates(c *gin.Context) {
	var req BatchCertificateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات گروهی نامعتبر است: " + err.Error()})
		return
	}

	if len(req.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "لیست دانشجویان خالی است"})
		return
	}

	issueDate := req.IssueDate
	if issueDate == "" {
		issueDate = time.Now().Format("2006-01-02")
	}

	head := req.AssociationHead
	if head == "" {
		head = "دبیر انجمن علمی مهندسی کامپیوتر"
	}

	now := time.Now()
	var created []models.Certificate

	for _, item := range req.Items {
		name := strings.TrimSpace(item.StudentName)
		if name == "" {
			continue
		}

		titlePrefix := strings.TrimSpace(item.TitlePrefix)
		gender := strings.TrimSpace(item.Gender)
		if titlePrefix == "" {
			if gender == "male" || gender == "مرد" || gender == "آقا" {
				titlePrefix = "جناب آقای"
				gender = "male"
			} else if gender == "female" || gender == "زن" || gender == "خانم" {
				titlePrefix = "سرکار خانم"
				gender = "female"
			}
		}

		customText := strings.TrimSpace(item.CustomText)
		if customText == "" {
			customText = strings.TrimSpace(req.CustomText)
		}

		cert := models.Certificate{
			ID:              generateCertID(),
			StudentName:     name,
			Gender:          gender,
			TitlePrefix:     titlePrefix,
			NationalID:      strings.TrimSpace(item.NationalID),
			StudentNumber:   strings.TrimSpace(item.StudentNumber),
			ProgramTitle:    req.ProgramTitle,
			ProgramDate:     req.ProgramDate,
			DurationHours:   req.DurationHours,
			Instructor:      req.Instructor,
			AssociationHead: head,
			Grade:           item.Grade,
			IssueDate:       issueDate,
			CustomText:      customText,
			Status:          "valid",
			CreatedAt:       now,
			UpdatedAt:       now,
		}

		if err := h.db.Create(&cert).Error; err == nil {
			created = append(created, cert)
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": fmt.Sprintf("تعداد %d گواهینامه با موفقیت صادر شد", len(created)),
		"count":   len(created),
		"items":   created,
	})
}

// UpdateCertificate updates an existing certificate
func (h *CertificateHandler) UpdateCertificate(c *gin.Context) {
	id := c.Param("id")
	var existing models.Certificate
	if err := h.db.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "گواهینامه مورد نظر یافت نشد"})
		return
	}

	var input models.Certificate
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	input.ID = id
	input.CreatedAt = existing.CreatedAt
	input.UpdatedAt = time.Now()

	if err := h.db.Save(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ویرایش گواهینامه"})
		return
	}

	c.JSON(http.StatusOK, input)
}

// ToggleCertificateStatus toggles between valid and revoked
func (h *CertificateHandler) ToggleCertificateStatus(c *gin.Context) {
	id := c.Param("id")
	var cert models.Certificate
	if err := h.db.First(&cert, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "گواهینامه مورد نظر یافت نشد"})
		return
	}

	if cert.Status == "valid" {
		cert.Status = "revoked"
	} else {
		cert.Status = "valid"
	}
	cert.UpdatedAt = time.Now()

	if err := h.db.Save(&cert).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در تغییر وضعیت گواهینامه"})
		return
	}

	c.JSON(http.StatusOK, cert)
}

// DeleteCertificate deletes a certificate
func (h *CertificateHandler) DeleteCertificate(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.Certificate{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف گواهینامه"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "گواهینامه با موفقیت حذف شد"})
}
