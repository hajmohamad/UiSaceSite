package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/internal/models"
)

type MemberHandler struct {
	db *gorm.DB
}

func NewMemberHandler(db *gorm.DB) *MemberHandler {
	return &MemberHandler{db: db}
}

func (h *MemberHandler) GetMembers(c *gin.Context) {
	yearStr := c.Query("year")

	var members []models.Member
	if err := h.db.Order("id ASC").Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست اعضا"})
		return
	}

	if yearStr != "" && yearStr != "all" {
		year, err := strconv.Atoi(yearStr)
		if err == nil {
			var filtered []models.Member
			for _, m := range members {
				for _, ms := range m.Memberships {
					if ms.Year == year {
						filtered = append(filtered, m)
						break
					}
				}
			}
			c.JSON(http.StatusOK, filtered)
			return
		}
	}

	c.JSON(http.StatusOK, members)
}

func (h *MemberHandler) GetMemberByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه عضو نامعتبر است"})
		return
	}

	var member models.Member
	if err := h.db.First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "عضو مورد نظر یافت نشد"})
		return
	}

	// Fetch programs where this member collaborated
	var allPrograms []models.Program
	h.db.Find(&allPrograms)

	var collaboratedPrograms []models.Program
	for _, p := range allPrograms {
		isCollab := false
		for _, colId := range p.Collaborators {
			if colId == id {
				isCollab = true
				break
			}
		}
		if !isCollab {
			for _, detail := range p.CollaboratorDetails {
				if detail.MemberID == id {
					isCollab = true
					break
				}
			}
		}
		if isCollab {
			collaboratedPrograms = append(collaboratedPrograms, p)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"member":               member,
		"collaboratedPrograms": collaboratedPrograms,
	})
}

func (h *MemberHandler) CreateMember(c *gin.Context) {
	var member models.Member
	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	if err := h.db.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در افزودن عضو جدید"})
		return
	}

	c.JSON(http.StatusCreated, member)
}

func (h *MemberHandler) UpdateMember(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه عضو نامعتبر است"})
		return
	}

	var member models.Member
	if err := h.db.First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "عضو مورد نظر یافت نشد"})
		return
	}

	var updateData models.Member
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است: " + err.Error()})
		return
	}

	updateData.ID = uint(id)
	if err := h.db.Save(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در بروزرسانی عضو"})
		return
	}

	c.JSON(http.StatusOK, updateData)
}

func (h *MemberHandler) DeleteMember(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه عضو نامعتبر است"})
		return
	}

	if err := h.db.Delete(&models.Member{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف عضو"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "عضو با موفقیت حذف شد"})
}
