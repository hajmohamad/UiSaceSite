package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"uisace-backend/config"
)

type UploadHandler struct {
	cfg *config.Config
}

func NewUploadHandler(cfg *config.Config) *UploadHandler {
	return &UploadHandler{cfg: cfg}
}

func (h *UploadHandler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "فایل ارسالی یافت نشد"})
		return
	}

	targetDir := filepath.Join(h.cfg.UploadDir, "general")
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد مسیر آپلود"})
		return
	}

	ext := filepath.Ext(file.Filename)
	safeExt := strings.ToLower(ext)
	filename := fmt.Sprintf("file_%d%s", time.Now().UnixNano(), safeExt)
	dst := filepath.Join(targetDir, filename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره فایل"})
		return
	}

	url := "/uploads/general/" + filename

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"url":      url,
		"filename": filename,
	})
}
