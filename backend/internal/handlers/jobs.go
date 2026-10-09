package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type JobHandler struct {
	db *gorm.DB
}

func NewJobHandler(db *gorm.DB) *JobHandler {
	return &JobHandler{db: db}
}

func (h *JobHandler) GetJobs(c *gin.Context) {
	var jobs []models.Job
	if err := h.db.Order("created_at DESC").Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست فرصت‌های شغلی"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

func (h *JobHandler) GetJobByID(c *gin.Context) {
	id := c.Param("id")

	var job models.Job
	if err := h.db.First(&job, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "فرصت شغلی مورد نظر یافت نشد"})
		return
	}

	c.JSON(http.StatusOK, job)
}

func (h *JobHandler) CreateJob(c *gin.Context) {
	var job models.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	if err := h.db.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد فرصت شغلی جدید"})
		return
	}

	c.JSON(http.StatusCreated, job)
}

func (h *JobHandler) UpdateJob(c *gin.Context) {
	id := c.Param("id")

	var job models.Job
	if err := h.db.First(&job, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "فرصت شغلی مورد نظر یافت نشد"})
		return
	}

	var updateData models.Job
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	updateData.ID = id
	if err := h.db.Save(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در بروزرسانی فرصت شغلی"})
		return
	}

	c.JSON(http.StatusOK, updateData)
}

func (h *JobHandler) DeleteJob(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Job{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف فرصت شغلی"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "فرصت شغلی با موفقیت حذف شد"})
}
