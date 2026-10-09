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

type RegistrationHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewRegistrationHandler(db *gorm.DB, cfg *config.Config) *RegistrationHandler {
	return &RegistrationHandler{db: db, cfg: cfg}
}

func (h *RegistrationHandler) CreateRegistration(c *gin.Context) {
	name := strings.TrimSpace(c.PostForm("name"))
	phone := strings.TrimSpace(c.PostForm("phone"))
	programIDStr := strings.TrimSpace(c.PostForm("programId"))
	isStudentStr := strings.TrimSpace(c.PostForm("isStudent"))
	studentNumber := strings.TrimSpace(c.PostForm("studentNumber"))

	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "لطفاً نام و نام خانوادگی را وارد کنید"})
		return
	}

	if phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "لطفاً شماره تلفن را وارد کنید"})
		return
	}

	programID, err := strconv.Atoi(programIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه برنامه نامعتبر است"})
		return
	}

	var program models.Program
	if err := h.db.First(&program, programID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "برنامه مورد نظر یافت نشد"})
		return
	}

	if program.Status == "past" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "مهلت ثبت‌نام در این برنامه به پایان رسیده است"})
		return
	}

	isStudent := isStudentStr == "true" || isStudentStr == "yes" || isStudentStr == "1"

	var receiptURL string
	file, err := c.FormFile("receipt")
	if err == nil && file != nil {
		receiptsDir := filepath.Join(h.cfg.UploadDir, "receipts")
		if err := os.MkdirAll(receiptsDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد پوشه ذخیره‌سازی رسید"})
			return
		}

		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("receipt_%d_%d%s", programID, time.Now().UnixNano(), ext)
		dst := filepath.Join(receiptsDir, filename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره فایل رسید"})
			return
		}
		receiptURL = "/uploads/receipts/" + filename
	} else if program.Price != nil && *program.Price > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "برای این دوره پولی، آپلود رسید الزامی است"})
		return
	}

	registration := models.Registration{
		ProgramID:     uint(programID),
		Name:          name,
		Phone:         phone,
		IsStudent:     isStudent,
		StudentNumber: studentNumber,
		ReceiptURL:    receiptURL,
		Status:        "pending",
	}

	if err := h.db.Create(&registration).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره اطلاعات ثبت‌نام"})
		return
	}

	// Increment registered participants count
	h.db.Model(&models.Program{}).Where("id = ?", program.ID).
		UpdateColumn("registered_count", gorm.Expr("registered_count + ?", 1))

	c.JSON(http.StatusCreated, gin.H{
		"success":      true,
		"message":      "ثبت‌نام شما با موفقیت انجام شد",
		"registration": registration,
	})
}

func (h *RegistrationHandler) GetRegistrations(c *gin.Context) {
	programID := c.Query("programId")
	status := c.Query("status")

	query := h.db.Model(&models.Registration{}).Preload("Program")

	if programID != "" {
		query = query.Where("program_id = ?", programID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var registrations []models.Registration
	if err := query.Order("created_at DESC").Find(&registrations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست ثبت‌نام‌ها"})
		return
	}

	c.JSON(http.StatusOK, registrations)
}

func (h *RegistrationHandler) UpdateRegistrationStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه نامعتبر است"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "وضعیت نامعتبر است"})
		return
	}

	if err := h.db.Model(&models.Registration{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در تغییر وضعیت"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "وضعیت با موفقیت بروز شد"})
}

func (h *RegistrationHandler) DeleteRegistration(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه نامعتبر است"})
		return
	}

	if err := h.db.Delete(&models.Registration{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف ثبت‌نام"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ثبت‌نام با موفقیت حذف شد"})
}
