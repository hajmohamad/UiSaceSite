package handlers

import (
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type PromoCodeHandler struct {
	db *gorm.DB
}

func NewPromoCodeHandler(db *gorm.DB) *PromoCodeHandler {
	return &PromoCodeHandler{db: db}
}

type ValidatePromoRequest struct {
	Code      string  `json:"code"`
	ProgramID uint    `json:"programId"`
	Price     float64 `json:"price"`
}

// ValidatePromoCode checks if a promo code is valid and calculates discounted price
func (h *PromoCodeHandler) ValidatePromoCode(c *gin.Context) {
	var req ValidatePromoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"valid": false, "error": "اطلاعات ارسالی نامعتبر است"})
		return
	}

	cleanCode := strings.ToUpper(strings.TrimSpace(req.Code))
	if cleanCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"valid": false, "error": "لطفاً کد تخفیف را وارد کنید"})
		return
	}

	var promo models.PromoCode
	err := h.db.Where("UPPER(code) = ?", cleanCode).First(&promo).Error
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"valid": false, "error": "کد تخفیف وارد شده معتبر نمی‌باشد"})
		return
	}

	if !promo.IsActive {
		c.JSON(http.StatusOK, gin.H{"valid": false, "error": "این کد تخفیف در حال حاضر غیرفعال است"})
		return
	}

	if promo.ExpiryDate != "" {
		exp, err := time.Parse("2006-01-02", promo.ExpiryDate)
		if err == nil && time.Now().After(exp.Add(24*time.Hour)) {
			c.JSON(http.StatusOK, gin.H{"valid": false, "error": "مهلت استفاده از این کد تخفیف به پایان رسیده است"})
			return
		}
	}

	if promo.MaxUses > 0 && promo.UsedCount >= promo.MaxUses {
		c.JSON(http.StatusOK, gin.H{"valid": false, "error": "ظرفیت استفاده از این کد تخفیف به پایان رسیده است"})
		return
	}

	if promo.ProgramID != nil && *promo.ProgramID > 0 && *promo.ProgramID != req.ProgramID {
		c.JSON(http.StatusOK, gin.H{"valid": false, "error": "این کد تخفیف برای این دوره یا رویداد معتبر نیست"})
		return
	}

	// Calculate discount
	basePrice := req.Price
	if basePrice <= 0 {
		c.JSON(http.StatusOK, gin.H{"valid": false, "error": "این رویداد رایگان است و نیازی به کد تخفیف ندارد"})
		return
	}

	var discountAmount float64
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

	finalPrice := math.Max(0, basePrice-discountAmount)

	var msg string
	if promo.DiscountType == "percent" {
		msg = fmt.Sprintf("کد تخفیف %d%% با موفقیت اعمال شد", int(promo.DiscountValue))
	} else {
		msg = fmt.Sprintf("تخفیف مبلغ %s تومان با موفقیت اعمال شد", fmt.Sprintf("%.0f", discountAmount))
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":          true,
		"code":           promo.Code,
		"discountType":   promo.DiscountType,
		"discountValue":  promo.DiscountValue,
		"discountAmount": discountAmount,
		"originalPrice":  basePrice,
		"finalPrice":     finalPrice,
		"message":        msg,
	})
}

// GetAdminPromoCodes returns all promo codes
func (h *PromoCodeHandler) GetAdminPromoCodes(c *gin.Context) {
	var promos []models.PromoCode
	if err := h.db.Order("created_at DESC").Find(&promos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت کدهای تخفیف"})
		return
	}

	c.JSON(http.StatusOK, promos)
}

// CreateAdminPromoCode creates a new promo code
func (h *PromoCodeHandler) CreateAdminPromoCode(c *gin.Context) {
	var promo models.PromoCode
	if err := c.ShouldBindJSON(&promo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	promo.Code = strings.ToUpper(strings.TrimSpace(promo.Code))
	if promo.Code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "کد تخفیف الزامی است"})
		return
	}

	if promo.DiscountValue <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "مقدار تخفیف باید بزرگتر از صفر باشد"})
		return
	}

	if promo.DiscountType == "" {
		promo.DiscountType = "percent"
	}

	now := time.Now()
	promo.CreatedAt = now
	promo.UpdatedAt = now

	if err := h.db.Create(&promo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد کد تخفیف (ممکن است کد تکراری باشد)"})
		return
	}

	c.JSON(http.StatusCreated, promo)
}

// UpdateAdminPromoCode updates a promo code
func (h *PromoCodeHandler) UpdateAdminPromoCode(c *gin.Context) {
	id := c.Param("id")
	var existing models.PromoCode
	if err := h.db.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "کد تخفیف مورد نظر یافت نشد"})
		return
	}

	var updateData models.PromoCode
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است"})
		return
	}

	updateData.ID = existing.ID
	updateData.Code = strings.ToUpper(strings.TrimSpace(updateData.Code))
	updateData.CreatedAt = existing.CreatedAt
	updateData.UpdatedAt = time.Now()

	if err := h.db.Save(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در بروزرسانی کد تخفیف"})
		return
	}

	c.JSON(http.StatusOK, updateData)
}

// ToggleAdminPromoCode toggles active status
func (h *PromoCodeHandler) ToggleAdminPromoCode(c *gin.Context) {
	id := c.Param("id")
	var promo models.PromoCode
	if err := h.db.First(&promo, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "کد تخفیف مورد نظر یافت نشد"})
		return
	}

	promo.IsActive = !promo.IsActive
	promo.UpdatedAt = time.Now()
	h.db.Save(&promo)

	c.JSON(http.StatusOK, promo)
}

// DeleteAdminPromoCode deletes a promo code
func (h *PromoCodeHandler) DeleteAdminPromoCode(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.PromoCode{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف کد تخفیف"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "کد تخفیف با موفقیت حذف شد"})
}
