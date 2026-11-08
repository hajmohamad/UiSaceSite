package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

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

// GetJobSettings returns general job feature settings
func (h *JobHandler) GetJobSettings(c *gin.Context) {
	var setting models.SiteSetting
	err := h.db.First(&setting, "key = ?", "job_settings").Error

	defaultSettings := models.JobFeatureSettings{
		Enabled:        true,
		StoppedMessage: "سامانه کاریابی و ثبت فرصت‌های شغلی موقتاً متوقف شده است. به زودی با موقعیت‌های شغلی جدید فعال خواهد شد.",
		ContactEmail:   "sace.ui.ac@gmail.com",
	}

	if err != nil {
		c.JSON(http.StatusOK, defaultSettings)
		return
	}

	var res models.JobFeatureSettings
	if err := json.Unmarshal([]byte(setting.Value), &res); err != nil {
		c.JSON(http.StatusOK, defaultSettings)
		return
	}

	c.JSON(http.StatusOK, res)
}

// UpdateJobSettings updates general job feature settings
func (h *JobHandler) UpdateJobSettings(c *gin.Context) {
	var input models.JobFeatureSettings
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات تنظیمات نامعتبر است: " + err.Error()})
		return
	}

	bytes, err := json.Marshal(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در پردازش اطلاعات تنظیمات"})
		return
	}

	var setting models.SiteSetting
	err = h.db.First(&setting, "key = ?", "job_settings").Error
	if err != nil {
		setting = models.SiteSetting{
			Key:       "job_settings",
			Value:     string(bytes),
			UpdatedAt: time.Now(),
		}
		if err := h.db.Create(&setting).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره تنظیمات کاریابی"})
			return
		}
	} else {
		setting.Value = string(bytes)
		setting.UpdatedAt = time.Now()
		if err := h.db.Save(&setting).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در به‌روزرسانی تنظیمات کاریابی"})
			return
		}
	}

	c.JSON(http.StatusOK, input)
}

// GetJobs returns list of jobs
func (h *JobHandler) GetJobs(c *gin.Context) {
	var jobs []models.Job
	if err := h.db.Order("created_at DESC").Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست فرصت‌های شغلی"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

// GetJobByID returns a single job
func (h *JobHandler) GetJobByID(c *gin.Context) {
	id := c.Param("id")

	var job models.Job
	if err := h.db.First(&job, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "فرصت شغلی مورد نظر یافت نشد"})
		return
	}

	c.JSON(http.StatusOK, job)
}

// CreateJob creates a new job
func (h *JobHandler) CreateJob(c *gin.Context) {
	var job models.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	if job.ID == "" {
		job.ID = fmt.Sprintf("job_%d", time.Now().UnixNano()%100000000)
	}

	if job.Status == "" {
		if job.IsStopped {
			job.Status = "stopped"
		} else {
			job.Status = "active"
		}
	} else if job.Status == "stopped" {
		job.IsStopped = true
	}

	now := time.Now()
	job.CreatedAt = now
	job.UpdatedAt = now

	if err := h.db.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد فرصت شغلی جدید: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, job)
}

// UpdateJob updates an existing job
func (h *JobHandler) UpdateJob(c *gin.Context) {
	id := c.Param("id")

	var existing models.Job
	if err := h.db.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "فرصت شغلی مورد نظر یافت نشد"})
		return
	}

	var updateData models.Job
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	updateData.ID = id
	updateData.CreatedAt = existing.CreatedAt
	updateData.UpdatedAt = time.Now()

	if updateData.Status == "stopped" {
		updateData.IsStopped = true
	} else if updateData.IsStopped {
		updateData.Status = "stopped"
	} else {
		updateData.Status = "active"
		updateData.IsStopped = false
	}

	if err := h.db.Save(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در بروزرسانی فرصت شغلی"})
		return
	}

	c.JSON(http.StatusOK, updateData)
}

// ToggleJobStatus toggles the active/stopped status of a job
func (h *JobHandler) ToggleJobStatus(c *gin.Context) {
	id := c.Param("id")

	var job models.Job
	if err := h.db.First(&job, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "فرصت شغلی مورد نظر یافت نشد"})
		return
	}

	job.IsStopped = !job.IsStopped
	if job.IsStopped {
		job.Status = "stopped"
	} else {
		job.Status = "active"
	}
	job.UpdatedAt = time.Now()

	if err := h.db.Save(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در تغییر وضعیت فرصت شغلی"})
		return
	}

	c.JSON(http.StatusOK, job)
}

// DeleteJob deletes a job
func (h *JobHandler) DeleteJob(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Job{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف فرصت شغلی"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "فرصت شغلی با موفقیت حذف شد"})
}
