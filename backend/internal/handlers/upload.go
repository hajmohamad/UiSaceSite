package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
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

type FileItem struct {
	Name    string    `json:"name"`
	Path    string    `json:"path"` // Relative path inside uploads, e.g., "general/file.png"
	URL     string    `json:"url"`  // Public access URL, e.g., "/uploads/general/file.png"
	Size    int64     `json:"size"`
	ModTime time.Time `json:"modTime"`
	Ext     string    `json:"ext"`
	IsImage bool      `json:"isImage"`
}

var imageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
	".svg":  true,
	".bmp":  true,
	".ico":  true,
	".avif": true,
}

func (h *UploadHandler) resolveSafePath(userRelPath string) (string, error) {
	cleanRel := filepath.Clean(strings.TrimPrefix(userRelPath, "/uploads/"))
	cleanRel = strings.TrimPrefix(cleanRel, "/")
	if strings.HasPrefix(cleanRel, "..") || filepath.IsAbs(cleanRel) {
		return "", fmt.Errorf("مسیر نامعتبر است")
	}

	absUploadDir, err := filepath.Abs(h.cfg.UploadDir)
	if err != nil {
		return "", err
	}

	fullPath := filepath.Clean(filepath.Join(absUploadDir, cleanRel))
	if !strings.HasPrefix(fullPath, absUploadDir) {
		return "", fmt.Errorf("دسترسی به خارج از پوشه آپلود مجاز نیست")
	}

	return fullPath, nil
}

// UploadFile handles single file upload (compatible with existing code)
func (h *UploadHandler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "فایل ارسالی یافت نشد"})
		return
	}

	folder := c.DefaultPostForm("folder", "general")
	folder = filepath.Clean(folder)
	if strings.Contains(folder, "..") || filepath.IsAbs(folder) {
		folder = "general"
	}

	targetDir := filepath.Join(h.cfg.UploadDir, folder)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد مسیر آپلود"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	baseName := strings.TrimSuffix(filepath.Base(file.Filename), ext)
	// Sanitize base name
	baseName = strings.ReplaceAll(baseName, " ", "_")
	if len(baseName) > 40 {
		baseName = baseName[:40]
	}
	filename := fmt.Sprintf("%s_%d%s", baseName, time.Now().UnixNano(), ext)
	dst := filepath.Join(targetDir, filename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره فایل"})
		return
	}

	relPath := filepath.ToSlash(filepath.Join(folder, filename))
	url := "/uploads/" + relPath

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"url":      url,
		"filename": filename,
		"path":     relPath,
		"size":     file.Size,
		"isImage":  imageExtensions[ext],
	})
}

// UploadMultipleFiles handles uploading multiple files at once
func (h *UploadHandler) UploadMultipleFiles(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "فرمت درخواست چندبخشی نامعتبر است"})
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		// Fallback to "file" key
		files = form.File["file"]
	}

	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "هیچ فایلی برای آپلود انتخاب نشده است"})
		return
	}

	folder := "general"
	if len(form.Value["folder"]) > 0 && form.Value["folder"][0] != "" {
		folder = filepath.Clean(form.Value["folder"][0])
		if strings.Contains(folder, "..") || filepath.IsAbs(folder) {
			folder = "general"
		}
	}

	targetDir := filepath.Join(h.cfg.UploadDir, folder)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد مسیر ذخیره‌سازی"})
		return
	}

	var uploaded []FileItem
	for _, file := range files {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		baseName := strings.TrimSuffix(filepath.Base(file.Filename), ext)
		baseName = strings.ReplaceAll(baseName, " ", "_")
		if len(baseName) > 40 {
			baseName = baseName[:40]
		}
		filename := fmt.Sprintf("%s_%d%s", baseName, time.Now().UnixNano(), ext)
		dst := filepath.Join(targetDir, filename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			continue
		}

		relPath := filepath.ToSlash(filepath.Join(folder, filename))
		uploaded = append(uploaded, FileItem{
			Name:    filename,
			Path:    relPath,
			URL:     "/uploads/" + relPath,
			Size:    file.Size,
			ModTime: time.Now(),
			Ext:     strings.TrimPrefix(ext, "."),
			IsImage: imageExtensions[ext],
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(uploaded),
		"files":   uploaded,
	})
}

// ListFiles lists all files in the upload directory
func (h *UploadHandler) ListFiles(c *gin.Context) {
	absUploadDir, err := filepath.Abs(h.cfg.UploadDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در یافتن مسیر آپلود"})
		return
	}

	if err := os.MkdirAll(absUploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد مسیر آپلود"})
		return
	}

	var files []FileItem
	err = filepath.Walk(absUploadDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			return nil
		}

		relPath, err := filepath.Rel(absUploadDir, path)
		if err != nil {
			return nil
		}

		relPathSlash := filepath.ToSlash(relPath)
		ext := strings.ToLower(filepath.Ext(info.Name()))

		files = append(files, FileItem{
			Name:    info.Name(),
			Path:    relPathSlash,
			URL:     "/uploads/" + relPathSlash,
			Size:    info.Size(),
			ModTime: info.ModTime(),
			Ext:     strings.TrimPrefix(ext, "."),
			IsImage: imageExtensions[ext],
		})
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در پیمایش فایل‌ها"})
		return
	}

	// Sort newest first
	sort.Slice(files, func(i, j int) bool {
		return files[i].ModTime.After(files[j].ModTime)
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"files":   files,
		"total":   len(files),
	})
}

// DeleteFile deletes a file from the upload directory
func (h *UploadHandler) DeleteFile(c *gin.Context) {
	var req struct {
		Path string `json:"path"`
	}

	if err := c.ShouldBindJSON(&req); err != nil || req.Path == "" {
		req.Path = c.Query("path")
	}

	if req.Path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "مسیر فایل الزامی است"})
		return
	}

	fullPath, err := h.resolveSafePath(req.Path)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "فایل مورد نظر یافت نشد"})
		return
	}

	if err := os.Remove(fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف فایل"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "فایل با موفقیت حذف شد",
	})
}

// RenameFile renames a file in the upload directory
func (h *UploadHandler) RenameFile(c *gin.Context) {
	var req struct {
		OldPath string `json:"oldPath" binding:"required"`
		NewName string `json:"newName" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است"})
		return
	}

	// Validate newName has no slashes or path traversal
	cleanNewName := filepath.Base(req.NewName)
	cleanNewName = strings.ReplaceAll(cleanNewName, "/", "")
	cleanNewName = strings.ReplaceAll(cleanNewName, "\\", "")
	cleanNewName = strings.TrimSpace(cleanNewName)
	if cleanNewName == "" || cleanNewName == "." {
		c.JSON(http.StatusBadRequest, gin.H{"error": "نام جدید فایل نامعتبر است"})
		return
	}

	oldFullPath, err := h.resolveSafePath(req.OldPath)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if _, err := os.Stat(oldFullPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "فایل اولیه یافت نشد"})
		return
	}

	// Preserve directory of old file
	parentDir := filepath.Dir(oldFullPath)
	newFullPath := filepath.Join(parentDir, cleanNewName)

	if _, err := os.Stat(newFullPath); err == nil && newFullPath != oldFullPath {
		c.JSON(http.StatusConflict, gin.H{"error": "فایلی با این نام از قبل وجود دارد"})
		return
	}

	if err := os.Rename(oldFullPath, newFullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در تغییر نام فایل"})
		return
	}

	absUploadDir, _ := filepath.Abs(h.cfg.UploadDir)
	relPath, _ := filepath.Rel(absUploadDir, newFullPath)
	relPathSlash := filepath.ToSlash(relPath)

	ext := strings.ToLower(filepath.Ext(cleanNewName))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "نام فایل با موفقیت تغییر یافت",
		"file": FileItem{
			Name:    cleanNewName,
			Path:    relPathSlash,
			URL:     "/uploads/" + relPathSlash,
			Ext:     strings.TrimPrefix(ext, "."),
			IsImage: imageExtensions[ext],
		},
	})
}

// ReplaceFile replaces an existing file with a new uploaded file
func (h *UploadHandler) ReplaceFile(c *gin.Context) {
	targetPath := c.PostForm("path")
	if targetPath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "مسیر فایل هدف الزامی است"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "فایل جدید ارسال نشده است"})
		return
	}

	fullPath, err := h.resolveSafePath(targetPath)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در باز کردن فایل آپلود شده"})
		return
	}
	defer src.Close()

	// Ensure destination directory exists
	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در آماده‌سازی مسیر"})
		return
	}

	// Create / overwrite destination file
	dst, err := os.Create(fullPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد فایل جایگزین"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ذخیره‌سازی داده‌های جدید"})
		return
	}

	absUploadDir, _ := filepath.Abs(h.cfg.UploadDir)
	relPath, _ := filepath.Rel(absUploadDir, fullPath)
	relPathSlash := filepath.ToSlash(relPath)
	ext := strings.ToLower(filepath.Ext(fullPath))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "فایل با موفقیت جایگزین شد",
		"file": FileItem{
			Name:    filepath.Base(fullPath),
			Path:    relPathSlash,
			URL:     "/uploads/" + relPathSlash,
			Size:    file.Size,
			ModTime: time.Now(),
			Ext:     strings.TrimPrefix(ext, "."),
			IsImage: imageExtensions[ext],
		},
	})
}
