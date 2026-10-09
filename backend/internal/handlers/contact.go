package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type ContactHandler struct {
	db *gorm.DB
}

func NewContactHandler(db *gorm.DB) *ContactHandler {
	return &ContactHandler{db: db}
}

type ContactRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required"`
	Message string `json:"message" binding:"required"`
}

func (h *ContactHandler) CreateContactMessage(c *gin.Context) {
	var req ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "لطفاً تمام فیلدها را به درستی تکمیل کنید"})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Message = strings.TrimSpace(req.Message)

	if req.Name == "" || req.Email == "" || req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "فیلدهای نام، ایمیل و پیام نمی‌توانند خالی باشند"})
		return
	}

	msg := models.ContactMessage{
		Name:    req.Name,
		Email:   req.Email,
		Message: req.Message,
		Status:  "unread",
	}

	if err := h.db.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ثبت پیام"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "پیام شما با موفقیت ارسال شد! از تماس شما متشکریم.",
		"id":      msg.ID,
	})
}

func (h *ContactHandler) GetContactMessages(c *gin.Context) {
	status := c.Query("status")
	query := h.db.Model(&models.ContactMessage{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var messages []models.ContactMessage
	if err := query.Order("created_at DESC").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت پیام‌ها"})
		return
	}

	c.JSON(http.StatusOK, messages)
}

func (h *ContactHandler) UpdateContactStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه پیام نامعتبر است"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "وضعیت نامعتبر است"})
		return
	}

	if err := h.db.Model(&models.ContactMessage{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در تغییر وضعیت پیام"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "وضعیت پیام بروز شد"})
}

func (h *ContactHandler) DeleteContactMessage(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه پیام نامعتبر است"})
		return
	}

	if err := h.db.Delete(&models.ContactMessage{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف پیام"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "پیام با موفقیت حذف شد"})
}
