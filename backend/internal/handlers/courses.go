package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type CourseHandler struct {
	db *gorm.DB
}

func NewCourseHandler(db *gorm.DB) *CourseHandler {
	return &CourseHandler{db: db}
}

func (h *CourseHandler) GetCourses(c *gin.Context) {
	var courses []models.Course
	if err := h.db.Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست دوره‌ها"})
		return
	}

	c.JSON(http.StatusOK, courses)
}

func (h *CourseHandler) GetCourseByID(c *gin.Context) {
	id := c.Param("id")

	var course models.Course
	if err := h.db.First(&course, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "دوره مورد نظر یافت نشد"})
		return
	}

	c.JSON(http.StatusOK, course)
}

func (h *CourseHandler) CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	if err := h.db.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد دوره جدید"})
		return
	}

	c.JSON(http.StatusCreated, course)
}

func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	id := c.Param("id")

	var course models.Course
	if err := h.db.First(&course, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "دوره مورد نظر یافت نشد"})
		return
	}

	var updateData models.Course
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	updateData.ID = id
	if err := h.db.Save(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در بروزرسانی دوره"})
		return
	}

	c.JSON(http.StatusOK, updateData)
}

func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Course{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف دوره"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "دوره با موفقیت حذف شد"})
}
