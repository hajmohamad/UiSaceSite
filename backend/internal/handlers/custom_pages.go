package handlers

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type CustomPageHandler struct {
	db *gorm.DB
}

func NewCustomPageHandler(db *gorm.DB) *CustomPageHandler {
	return &CustomPageHandler{db: db}
}

// normalizeSlug strips leading and trailing slashes and spaces
func normalizeSlug(slug string) string {
	slug = strings.TrimSpace(slug)
	slug = strings.TrimPrefix(slug, "/")
	slug = strings.TrimSuffix(slug, "/")
	return strings.ToLower(slug)
}

// GetPublicPageBySlug retrieves an active custom page by slug or path
func (h *CustomPageHandler) GetPublicPageBySlug(c *gin.Context) {
	slug := c.Query("slug")
	if slug == "" {
		slug = c.Query("path")
	}
	if slug == "" {
		slug = c.Param("slug")
	}

	cleanSlug := normalizeSlug(slug)
	if cleanSlug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "آدرس صفحه مشخص نشده است"})
		return
	}

	var page models.CustomPage
	if err := h.db.Where("slug = ? AND is_active = ?", cleanSlug, true).First(&page).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "صفحه مورد نظر یافت نشد"})
		return
	}

	c.JSON(http.StatusOK, page)
}

// RenderPageBySlug serves the raw HTML directly
func (h *CustomPageHandler) RenderPageBySlug(c *gin.Context) {
	slug := c.Param("slug")
	cleanSlug := normalizeSlug(slug)

	var page models.CustomPage
	if err := h.db.Where("slug = ? AND is_active = ?", cleanSlug, true).First(&page).Error; err != nil {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusNotFound, "<h1>۴۰۴ - صفحه یافت نشد</h1><p>صفحه مورد نظر در انجمن علمی وجود ندارد یا غیرفعال شده است.</p>")
		return
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.String(http.StatusOK, page.HTMLContent)
}

// GetAdminPages lists all custom pages
func (h *CustomPageHandler) GetAdminPages(c *gin.Context) {
	var pages []models.CustomPage
	query := h.db.Order("created_at DESC")

	if q := strings.TrimSpace(c.Query("q")); q != "" {
		query = query.Where("title LIKE ? OR slug LIKE ?", "%"+q+"%", "%"+q+"%")
	}

	if err := query.Find(&pages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست صفحات"})
		return
	}

	c.JSON(http.StatusOK, pages)
}

// GetAdminPageByID gets a single custom page by ID
func (h *CustomPageHandler) GetAdminPageByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه صفحه نامعتبر است"})
		return
	}

	var page models.CustomPage
	if err := h.db.First(&page, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "صفحه یافت نشد"})
		return
	}

	c.JSON(http.StatusOK, page)
}

type CreateCustomPageRequest struct {
	Title       string `json:"title" form:"title" binding:"required"`
	Slug        string `json:"slug" form:"slug" binding:"required"`
	HTMLContent string `json:"htmlContent" form:"htmlContent"`
	IsActive    *bool  `json:"isActive" form:"isActive"`
	WithLayout  *bool  `json:"withLayout" form:"withLayout"`
}

// CreatePage creates a new custom HTML page
func (h *CustomPageHandler) CreatePage(c *gin.Context) {
	contentType := c.GetHeader("Content-Type")

	var title, slug, htmlContent string
	isActive := true
	withLayout := false

	if strings.Contains(contentType, "multipart/form-data") {
		title = strings.TrimSpace(c.PostForm("title"))
		slug = normalizeSlug(c.PostForm("slug"))
		if activeStr := c.PostForm("isActive"); activeStr != "" {
			isActive = activeStr == "true" || activeStr == "1"
		}
		if layoutStr := c.PostForm("withLayout"); layoutStr != "" {
			withLayout = layoutStr == "true" || layoutStr == "1"
		}

		// Check if file is uploaded
		file, _, err := c.Request.FormFile("htmlFile")
		if err == nil && file != nil {
			defer file.Close()
			bytes, err := io.ReadAll(file)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "خطا در خواندن فایل HTML"})
				return
			}
			htmlContent = string(bytes)
		} else {
			htmlContent = c.PostForm("htmlContent")
		}
	} else {
		var req CreateCustomPageRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "داده‌های ورودی نامعتبر است: " + err.Error()})
			return
		}
		title = strings.TrimSpace(req.Title)
		slug = normalizeSlug(req.Slug)
		htmlContent = req.HTMLContent
		if req.IsActive != nil {
			isActive = *req.IsActive
		}
		if req.WithLayout != nil {
			withLayout = *req.WithLayout
		}
	}

	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "عنوان صفحه الزامی است"})
		return
	}
	if slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "آدرس (slug) صفحه الزامی است"})
		return
	}
	if strings.TrimSpace(htmlContent) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "محتوای HTML صفحه نمی‌تواند خالی باشد"})
		return
	}

	// Check for unique slug
	var count int64
	h.db.Model(&models.CustomPage{}).Where("slug = ?", slug).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("آدرس (slug) «%s» قبلاً استفاده شده است", slug)})
		return
	}

	page := models.CustomPage{
		Title:       title,
		Slug:        slug,
		HTMLContent: htmlContent,
		IsActive:    isActive,
		WithLayout:  withLayout,
	}

	if err := h.db.Create(&page).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره صفحه: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, page)
}

// UpdatePage updates an existing custom page
func (h *CustomPageHandler) UpdatePage(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه صفحه نامعتبر است"})
		return
	}

	var page models.CustomPage
	if err := h.db.First(&page, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "صفحه یافت نشد"})
		return
	}

	contentType := c.GetHeader("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		if t := strings.TrimSpace(c.PostForm("title")); t != "" {
			page.Title = t
		}
		if s := c.PostForm("slug"); s != "" {
			page.Slug = normalizeSlug(s)
		}
		if activeStr := c.PostForm("isActive"); activeStr != "" {
			page.IsActive = activeStr == "true" || activeStr == "1"
		}
		if layoutStr := c.PostForm("withLayout"); layoutStr != "" {
			page.WithLayout = layoutStr == "true" || layoutStr == "1"
		}

		// Optional file
		file, _, err := c.Request.FormFile("htmlFile")
		if err == nil && file != nil {
			defer file.Close()
			bytes, err := io.ReadAll(file)
			if err == nil {
				page.HTMLContent = string(bytes)
			}
		} else if rawHtml := c.PostForm("htmlContent"); rawHtml != "" {
			page.HTMLContent = rawHtml
		}
	} else {
		var req CreateCustomPageRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "داده‌های ورودی نامعتبر است"})
			return
		}
		if strings.TrimSpace(req.Title) != "" {
			page.Title = strings.TrimSpace(req.Title)
		}
		if req.Slug != "" {
			page.Slug = normalizeSlug(req.Slug)
		}
		if strings.TrimSpace(req.HTMLContent) != "" {
			page.HTMLContent = req.HTMLContent
		}
		if req.IsActive != nil {
			page.IsActive = *req.IsActive
		}
		if req.WithLayout != nil {
			page.WithLayout = *req.WithLayout
		}
	}

	// Verify slug uniqueness against other records
	var count int64
	h.db.Model(&models.CustomPage{}).Where("slug = ? AND id != ?", page.Slug, page.ID).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("آدرس (slug) «%s» قبلاً برای صفحه دیگری ثبت شده است", page.Slug)})
		return
	}

	if err := h.db.Save(&page).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در به‌روزرسانی صفحه"})
		return
	}

	c.JSON(http.StatusOK, page)
}

// DeletePage deletes a custom page
func (h *CustomPageHandler) DeletePage(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه صفحه نامعتبر است"})
		return
	}

	if err := h.db.Delete(&models.CustomPage{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف صفحه"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "صفحه با موفقیت حذف شد"})
}
