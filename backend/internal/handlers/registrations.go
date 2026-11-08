package handlers

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"math"
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
	promoCodeInput := strings.ToUpper(strings.TrimSpace(c.PostForm("promoCode")))

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

	// Calculate base and discounted price
	basePrice := 0.0
	if program.Price != nil {
		basePrice = *program.Price
	}

	discountAmount := 0.0
	finalPrice := basePrice
	appliedPromoCode := ""

	if promoCodeInput != "" && basePrice > 0 {
		var promo models.PromoCode
		if err := h.db.Where("UPPER(code) = ? AND is_active = ?", promoCodeInput, true).First(&promo).Error; err == nil {
			// Check expiration
			valid := true
			if promo.ExpiryDate != "" {
				exp, err := time.Parse("2006-01-02", promo.ExpiryDate)
				if err == nil && time.Now().After(exp.Add(24*time.Hour)) {
					valid = false
				}
			}
			if promo.MaxUses > 0 && promo.UsedCount >= promo.MaxUses {
				valid = false
			}
			if promo.ProgramID != nil && *promo.ProgramID > 0 && *promo.ProgramID != uint(programID) {
				valid = false
			}

			if valid {
				if promo.DiscountType == "percent" {
					discountAmount = basePrice * (promo.DiscountValue / 100.0)
					if promo.MaxDiscount != nil && *promo.MaxDiscount > 0 && discountAmount > *promo.MaxDiscount {
						discountAmount = *promo.MaxDiscount
					}
				} else {
					discountAmount = promo.DiscountValue
				}
				if discountAmount > basePrice {
					discountAmount = basePrice
				}
				finalPrice = math.Max(0, basePrice-discountAmount)
				appliedPromoCode = promo.Code

				// Increment promo code used count
				h.db.Model(&models.PromoCode{}).Where("id = ?", promo.ID).
					UpdateColumn("used_count", gorm.Expr("used_count + ?", 1))
			}
		}
	}

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
	} else if finalPrice > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "برای این دوره پولی، آپلود رسید واریز الزامی است"})
		return
	}

	registration := models.Registration{
		ProgramID:      uint(programID),
		Name:           name,
		Phone:          phone,
		IsStudent:      isStudent,
		StudentNumber:  studentNumber,
		ReceiptURL:     receiptURL,
		Status:         "pending",
		PromoCode:      appliedPromoCode,
		DiscountAmount: discountAmount,
		FinalPrice:     finalPrice,
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

// ExportRegistrationsCSV generates and streams a UTF-8 BOM encoded CSV file for Excel
func (h *RegistrationHandler) ExportRegistrationsCSV(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در استخراج اطلاعات"})
		return
	}

	buf := new(bytes.Buffer)
	// Write UTF-8 BOM so Persian characters display correctly in Microsoft Excel
	buf.WriteString("\xEF\xBB\xBF")

	writer := csv.NewWriter(buf)
	headers := []string{
		"ردیف",
		"نام و نام خانوادگی",
		"شماره تماس",
		"دانشجو بودن",
		"شماره دانشجویی",
		"عنوان رویداد",
		"کد تخفیف",
		"مبلغ تخفیف (تومان)",
		"مبلغ پرداختی (تومان)",
		"وضعیت ثبت‌نام",
		"تاریخ ثبت‌نام",
		"لینک رسید",
	}
	_ = writer.Write(headers)

	for i, r := range registrations {
		studentStatus := "خیر"
		if r.IsStudent {
			studentStatus = "بله"
		}

		progTitle := ""
		if r.Program != nil {
			progTitle = r.Program.Title
		}

		statusFa := "در انتظار بررسی"
		if r.Status == "approved" {
			statusFa = "تایید شده"
		} else if r.Status == "rejected" {
			statusFa = "رد شده"
		}

		row := []string{
			strconv.Itoa(i + 1),
			r.Name,
			r.Phone,
			studentStatus,
			r.StudentNumber,
			progTitle,
			r.PromoCode,
			fmt.Sprintf("%.0f", r.DiscountAmount),
			fmt.Sprintf("%.0f", r.FinalPrice),
			statusFa,
			r.CreatedAt.Format("2006-01-02 15:04"),
			r.ReceiptURL,
		}
		_ = writer.Write(row)
	}
	writer.Flush()

	filename := fmt.Sprintf("registrations_%s.csv", time.Now().Format("20060102_150405"))
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Data(http.StatusOK, "text/csv; charset=utf-8", buf.Bytes())
}
