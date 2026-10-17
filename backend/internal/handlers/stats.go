package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type StatsHandler struct {
	db *gorm.DB
}

func NewStatsHandler(db *gorm.DB) *StatsHandler {
	return &StatsHandler{db: db}
}

func (h *StatsHandler) GetStats(c *gin.Context) {
	var membersCount int64
	var programsCount int64
	var upcomingProgramsCount int64
	var coursesCount int64
	var jobsCount int64
	var registrationsCount int64
	var formsCount int64
	var responsesCount int64

	h.db.Model(&models.Member{}).Count(&membersCount)
	h.db.Model(&models.Program{}).Count(&programsCount)
	h.db.Model(&models.Program{}).Where("status = ?", "upcoming").Count(&upcomingProgramsCount)
	h.db.Model(&models.Course{}).Count(&coursesCount)
	h.db.Model(&models.Job{}).Count(&jobsCount)
	h.db.Model(&models.Registration{}).Count(&registrationsCount)
	h.db.Model(&models.PorslineForm{}).Count(&formsCount)
	h.db.Model(&models.FormResponse{}).Count(&responsesCount)

	c.JSON(http.StatusOK, gin.H{
		"membersCount":          membersCount,
		"programsCount":         programsCount,
		"upcomingProgramsCount": upcomingProgramsCount,
		"coursesCount":          coursesCount,
		"jobsCount":             jobsCount,
		"registrationsCount":    registrationsCount,
		"formsCount":            formsCount,
		"responsesCount":        responsesCount,
	})
}
