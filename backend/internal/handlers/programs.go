package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type ProgramHandler struct {
	db *gorm.DB
}

func NewProgramHandler(db *gorm.DB) *ProgramHandler {
	return &ProgramHandler{db: db}
}

func (h *ProgramHandler) GetPrograms(c *gin.Context) {
	status := c.Query("status")
	year := c.Query("year")
	search := c.Query("search")

	query := h.db.Model(&models.Program{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if year != "" && year != "all" {
		query = query.Where("date_iso LIKE ? OR date LIKE ?", year+"%", "%"+year+"%")
	}

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(short_description) LIKE ?", searchPattern, searchPattern)
	}

	var programs []models.Program
	// Default sort by dateISO descending
	if err := query.Order("date_iso DESC").Find(&programs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست برنامه‌ها"})
		return
	}

	c.JSON(http.StatusOK, programs)
}

func (h *ProgramHandler) GetProgramByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه برنامه نامعتبر است"})
		return
	}

	var program models.Program
	if err := h.db.First(&program, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "برنامه مورد نظر یافت نشد"})
		return
	}

	c.JSON(http.StatusOK, program)
}

func (h *ProgramHandler) CreateProgram(c *gin.Context) {
	var program models.Program
	if err := c.ShouldBindJSON(&program); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	if err := h.db.Create(&program).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد برنامه جدید"})
		return
	}

	c.JSON(http.StatusCreated, program)
}

func (h *ProgramHandler) UpdateProgram(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه برنامه نامعتبر است"})
		return
	}

	var program models.Program
	if err := h.db.First(&program, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "برنامه مورد نظر یافت نشد"})
		return
	}

	var updateData models.Program
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	updateData.ID = uint(id)
	if err := h.db.Save(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در بروزرسانی برنامه"})
		return
	}

	c.JSON(http.StatusOK, updateData)
}

func (h *ProgramHandler) DeleteProgram(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه برنامه نامعتبر است"})
		return
	}

	if err := h.db.Delete(&models.Program{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف برنامه"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "برنامه با موفقیت حذف شد"})
}
