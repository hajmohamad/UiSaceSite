package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/config"
	"uisace-backend/internal/models"
)

type MediaLinksHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewMediaLinksHandler(db *gorm.DB, cfg *config.Config) *MediaLinksHandler {
	return &MediaLinksHandler{
		db:  db,
		cfg: cfg,
	}
}

type MediaLinkItem struct {
	URL         string   `json:"url"`
	Occurrences int      `json:"occurrences"`
	Sources     []string `json:"sources"`
	IsLocal     bool     `json:"isLocal"`
}

type MediaLinksResponse struct {
	LinksText   string          `json:"linksText"` // Every link on a separate line
	Links       []MediaLinkItem `json:"links"`
	Stats       MediaStats      `json:"stats"`
}

type MediaStats struct {
	TotalOccurrences int `json:"totalOccurrences"`
	UniqueLinks      int `json:"uniqueLinks"`
	StorageLinks     int `json:"storageLinks"`
	LocalLinks       int `json:"localLinks"`
}

var mediaExtRegex = regexp.MustCompile(`(?i)\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|mp4|webm|ogg|mov|mkv|avi|mp3|wav|pdf|zip|rar)(?:\?[^"'\s]*)?$`)
var quotedURLRegex = regexp.MustCompile(`["']((?:https?://|/uploads/)[^"']+)["']`)

func isMediaURL(urlStr string) bool {
	urlStr = strings.TrimSpace(urlStr)
	if urlStr == "" {
		return false
	}
	lower := strings.ToLower(urlStr)
	if mediaExtRegex.MatchString(lower) {
		return true
	}
	if strings.HasPrefix(lower, "/uploads/") && strings.Contains(lower, ".") {
		return true
	}
	if (strings.Contains(lower, "storage.") || strings.Contains(lower, "liara.space") || strings.Contains(lower, "ghavishomard")) &&
		(strings.Contains(lower, "/photos/") || strings.Contains(lower, "/members/") || strings.Contains(lower, "/programs/")) {
		return mediaExtRegex.MatchString(lower)
	}
	return false
}

// locateProjectRoot finds the root folder containing constants.ts
func locateProjectRoot() string {
	candidates := []string{".", "..", "../.."}
	for _, c := range candidates {
		if _, err := os.Stat(filepath.Join(c, "constants.ts")); err == nil {
			return c
		}
	}
	return "."
}

// GetAllMediaLinks scans the database and code constants for all media links
func (h *MediaLinksHandler) GetAllMediaLinks(c *gin.Context) {
	linkMap := make(map[string]*MediaLinkItem)

	recordLink := func(rawUrl, source string) {
		trimmed := strings.TrimSpace(rawUrl)
		if trimmed == "" || !isMediaURL(trimmed) {
			return
		}
		if item, exists := linkMap[trimmed]; exists {
			item.Occurrences++
			hasSource := false
			for _, s := range item.Sources {
				if s == source {
					hasSource = true
					break
				}
			}
			if !hasSource {
				item.Sources = append(item.Sources, source)
			}
		} else {
			isLocal := strings.HasPrefix(trimmed, "/uploads/") || strings.Contains(trimmed, "localhost")
			linkMap[trimmed] = &MediaLinkItem{
				URL:         trimmed,
				Occurrences: 1,
				Sources:     []string{source},
				IsLocal:     isLocal,
			}
		}
	}

	// 1. Members
	var members []models.Member
	if err := h.db.Find(&members).Error; err == nil {
		for _, m := range members {
			if m.ImageURL != "" {
				recordLink(m.ImageURL, "اعضا (تصویر پروفایل)")
			}
		}
	}

	// 2. Programs
	var programs []models.Program
	if err := h.db.Find(&programs).Error; err == nil {
		for _, p := range programs {
			if p.ImageURL != "" {
				recordLink(p.ImageURL, "رویدادها (پوستر اصلی)")
			}
			for _, img := range p.Gallery.Images {
				recordLink(img, "رویدادها (تصاویر گالری)")
			}
			for _, vid := range p.Gallery.Videos {
				recordLink(vid, "رویدادها (ویدیوهای گالری)")
			}
			for _, sp := range p.Sponsors {
				if sp.LogoURL != "" {
					recordLink(sp.LogoURL, "رویدادها (لوگوی حامیان)")
				}
			}
			for _, col := range p.CollaboratorDetails {
				if col.ImageURL != "" {
					recordLink(col.ImageURL, "رویدادها (تصویر همکاران)")
				}
			}
		}
	}

	// 3. Courses
	var courses []models.Course
	if err := h.db.Find(&courses).Error; err == nil {
		for _, cr := range courses {
			if cr.ImageURL != "" {
				recordLink(cr.ImageURL, "دوره‌ها (تصویر دوره)")
			}
			for _, sec := range cr.Sections {
				for _, v := range sec.Videos {
					if v.URL != "" {
						recordLink(v.URL, "دوره‌ها (ویدیو)")
					}
				}
				for _, f := range sec.Files {
					if f.URL != "" {
						recordLink(f.URL, "دوره‌ها (فایل ضمیمه)")
					}
				}
			}
		}
	}

	// 4. Jobs
	var jobs []models.Job
	if err := h.db.Find(&jobs).Error; err == nil {
		for _, j := range jobs {
			if j.Logo != "" {
				recordLink(j.Logo, "فرصت‌های شغلی (لوگو)")
			}
		}
	}

	// 5. Registrations
	var registrations []models.Registration
	if err := h.db.Find(&registrations).Error; err == nil {
		for _, r := range registrations {
			if r.ReceiptURL != "" {
				recordLink(r.ReceiptURL, "ثبت‌نام‌ها (تصویر فیش)")
			}
		}
	}

	// 6. Custom HTML Pages
	var customPages []models.CustomPage
	if err := h.db.Find(&customPages).Error; err == nil {
		for _, cp := range customPages {
			matches := quotedURLRegex.FindAllStringSubmatch(cp.HTMLContent, -1)
			for _, m := range matches {
				if len(m) > 1 && isMediaURL(m[1]) {
					recordLink(m[1], fmt.Sprintf("صفحات سفارشی (%s)", cp.Title))
				}
			}
		}
	}

	// 7. Check Static Files in Codebase (constants.ts, arvanconstan.ts, seeds)
	root := locateProjectRoot()
	scanFile := func(relPath, label string) {
		fullPath := filepath.Join(root, relPath)
		content, err := os.ReadFile(fullPath)
		if err == nil {
			matches := quotedURLRegex.FindAllStringSubmatch(string(content), -1)
			for _, m := range matches {
				if len(m) > 1 && isMediaURL(m[1]) {
					recordLink(m[1], label)
				}
			}
		}
	}

	scanFile("constants.ts", "سورس‌کد (constants.ts)")
	scanFile("arvanconstan.ts", "سورس‌کد (arvanconstan.ts)")
	scanFile("backend/internal/database/seeds/members.json", "فایل سیدها (members.json)")
	scanFile("backend/internal/database/seeds/programs.json", "فایل سیدها (programs.json)")
	scanFile("backend/internal/database/seeds/courses.json", "فایل سیدها (courses.json)")
	scanFile("backend/internal/database/seeds/jobs.json", "فایل سیدها (jobs.json)")

	// Build sorted response
	var linkList []MediaLinkItem
	var linksTextBuilder strings.Builder

	stats := MediaStats{
		UniqueLinks: len(linkMap),
	}

	// Sort keys for deterministic output
	var keys []string
	for k := range linkMap {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, k := range keys {
		item := linkMap[k]
		linkList = append(linkList, *item)
		stats.TotalOccurrences += item.Occurrences
		if item.IsLocal {
			stats.LocalLinks++
		} else {
			stats.StorageLinks++
		}
		linksTextBuilder.WriteString(item.URL)
		linksTextBuilder.WriteString("\n")
	}

	c.JSON(http.StatusOK, MediaLinksResponse{
		LinksText: strings.TrimRight(linksTextBuilder.String(), "\n"),
		Links:     linkList,
		Stats:     stats,
	})
}

// ExportMediaLinksTxt exports the media links as a plain-text downloadable file
func (h *MediaLinksHandler) ExportMediaLinksTxt(c *gin.Context) {
	// Re-run extraction or use helper
	c.Header("Content-Disposition", "attachment; filename=\"media_links.txt\"")
	c.Header("Content-Type", "text/plain; charset=utf-8")

	// Call internal extraction
	// For efficiency, trigger GetAllMediaLinks logic
	// Simplified: write directly
	var urls []string
	var members []models.Member
	if err := h.db.Find(&members).Error; err == nil {
		for _, m := range members {
			if m.ImageURL != "" && isMediaURL(m.ImageURL) {
				urls = append(urls, m.ImageURL)
			}
		}
	}
	var programs []models.Program
	if err := h.db.Find(&programs).Error; err == nil {
		for _, p := range programs {
			if p.ImageURL != "" && isMediaURL(p.ImageURL) {
				urls = append(urls, p.ImageURL)
			}
			for _, img := range p.Gallery.Images {
				if isMediaURL(img) {
					urls = append(urls, img)
				}
			}
		}
	}

	// De-duplicate
	seen := make(map[string]bool)
	var output strings.Builder
	for _, u := range urls {
		trimmed := strings.TrimSpace(u)
		if trimmed != "" && !seen[trimmed] {
			seen[trimmed] = true
			output.WriteString(trimmed)
			output.WriteString("\n")
		}
	}

	c.String(http.StatusOK, output.String())
}

type ReplaceMediaLinksRequest struct {
	Mode              string            `json:"mode"` // "line_by_line" | "find_replace" | "mappings"
	OriginalText      string            `json:"originalText"`
	NewText           string            `json:"newText"`
	Find              string            `json:"find"`
	Replace           string            `json:"replace"`
	Mappings          map[string]string `json:"mappings"`
	UpdateStaticFiles *bool             `json:"updateStaticFiles"`
}

// ReplaceMediaLinks handles replacing media links across database and static files
func (h *MediaLinksHandler) ReplaceMediaLinks(c *gin.Context) {
	var req ReplaceMediaLinksRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "داده‌های ارسالی نامعتبر است: " + err.Error()})
		return
	}

	replaceMap := make(map[string]string)

	switch req.Mode {
	case "line_by_line":
		origLines := strings.Split(strings.ReplaceAll(req.OriginalText, "\r\n", "\n"), "\n")
		newLines := strings.Split(strings.ReplaceAll(req.NewText, "\r\n", "\n"), "\n")

		minLen := len(origLines)
		if len(newLines) < minLen {
			minLen = len(newLines)
		}

		for i := 0; i < minLen; i++ {
			oldUrl := strings.TrimSpace(origLines[i])
			newUrl := strings.TrimSpace(newLines[i])
			if oldUrl != "" && newUrl != "" && oldUrl != newUrl {
				replaceMap[oldUrl] = newUrl
			}
		}

	case "find_replace":
		if strings.TrimSpace(req.Find) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "عبارت یا آدرس مبدأ برای جایگزینی الزامی است"})
			return
		}
		// If find_replace mode is selected, we replace occurrences in DB and files directly
		// We'll also support it via replaceMap if mappings are generated or through raw string replace.

	case "mappings":
		for k, v := range req.Mappings {
			oldUrl := strings.TrimSpace(k)
			newUrl := strings.TrimSpace(v)
			if oldUrl != "" && newUrl != "" && oldUrl != newUrl {
				replaceMap[oldUrl] = newUrl
			}
		}

	default:
		// Attempt line-by-line if originalText and newText exist
		if req.OriginalText != "" && req.NewText != "" {
			origLines := strings.Split(strings.ReplaceAll(req.OriginalText, "\r\n", "\n"), "\n")
			newLines := strings.Split(strings.ReplaceAll(req.NewText, "\r\n", "\n"), "\n")
			minLen := len(origLines)
			if len(newLines) < minLen {
				minLen = len(newLines)
			}
			for i := 0; i < minLen; i++ {
				oldUrl := strings.TrimSpace(origLines[i])
				newUrl := strings.TrimSpace(newLines[i])
				if oldUrl != "" && newUrl != "" && oldUrl != newUrl {
					replaceMap[oldUrl] = newUrl
				}
			}
		}
	}

	if req.Mode != "find_replace" && len(replaceMap) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "هیچ تغییری در لینک‌ها مشخص نشده است یا لینک‌های ورودی یکسان هستند"})
		return
	}

	shouldUpdateFiles := true
	if req.UpdateStaticFiles != nil {
		shouldUpdateFiles = *req.UpdateStaticFiles
	}

	affectedSummary := make(map[string]int)
	totalReplaced := 0

	// Helper function to replace in a string
	replaceString := func(input string) (string, bool) {
		if input == "" {
			return input, false
		}
		if req.Mode == "find_replace" {
			if strings.Contains(input, req.Find) {
				return strings.ReplaceAll(input, req.Find, req.Replace), true
			}
			return input, false
		}

		// Exact map replace first
		if target, ok := replaceMap[input]; ok {
			return target, true
		}
		// Partial map replace for strings containing the URL
		changed := false
		result := input
		for oldU, newU := range replaceMap {
			if strings.Contains(result, oldU) {
				result = strings.ReplaceAll(result, oldU, newU)
				changed = true
			}
		}
		return result, changed
	}

	// Execute DB updates in transaction
	err := h.db.Transaction(func(tx *gorm.DB) error {
		// 1. Members
		var members []models.Member
		if err := tx.Find(&members).Error; err == nil {
			for _, m := range members {
				newUrl, changed := replaceString(m.ImageURL)
				if changed {
					if err := tx.Model(&models.Member{}).Where("id = ?", m.ID).Update("image_url", newUrl).Error; err == nil {
						affectedSummary["members"]++
						totalReplaced++
					}
				}
			}
		}

		// 2. Programs
		var programs []models.Program
		if err := tx.Find(&programs).Error; err == nil {
			for _, p := range programs {
				programChanged := false
				newPoster, ch := replaceString(p.ImageURL)
				if ch {
					p.ImageURL = newPoster
					programChanged = true
				}

				for i, img := range p.Gallery.Images {
					newImg, ch := replaceString(img)
					if ch {
						p.Gallery.Images[i] = newImg
						programChanged = true
					}
				}

				for i, vid := range p.Gallery.Videos {
					newVid, ch := replaceString(vid)
					if ch {
						p.Gallery.Videos[i] = newVid
						programChanged = true
					}
				}

				for i, sp := range p.Sponsors {
					newLogo, ch := replaceString(sp.LogoURL)
					if ch {
						p.Sponsors[i].LogoURL = newLogo
						programChanged = true
					}
				}

				for i, col := range p.CollaboratorDetails {
					newColImg, ch := replaceString(col.ImageURL)
					if ch {
						p.CollaboratorDetails[i].ImageURL = newColImg
						programChanged = true
					}
				}

				if programChanged {
					if err := tx.Save(&p).Error; err == nil {
						affectedSummary["programs"]++
						totalReplaced++
					}
				}
			}
		}

		// 3. Courses
		var courses []models.Course
		if err := tx.Find(&courses).Error; err == nil {
			for _, cr := range courses {
				courseChanged := false
				newImg, ch := replaceString(cr.ImageURL)
				if ch {
					cr.ImageURL = newImg
					courseChanged = true
				}

				for sIdx, sec := range cr.Sections {
					for vIdx, vid := range sec.Videos {
						newVid, ch := replaceString(vid.URL)
						if ch {
							cr.Sections[sIdx].Videos[vIdx].URL = newVid
							courseChanged = true
						}
					}
					for fIdx, file := range sec.Files {
						newFile, ch := replaceString(file.URL)
						if ch {
							cr.Sections[sIdx].Files[fIdx].URL = newFile
							courseChanged = true
						}
					}
				}

				if courseChanged {
					if err := tx.Save(&cr).Error; err == nil {
						affectedSummary["courses"]++
						totalReplaced++
					}
				}
			}
		}

		// 4. Jobs
		var jobs []models.Job
		if err := tx.Find(&jobs).Error; err == nil {
			for _, j := range jobs {
				newLogo, ch := replaceString(j.Logo)
				if ch {
					if err := tx.Model(&models.Job{}).Where("id = ?", j.ID).Update("logo", newLogo).Error; err == nil {
						affectedSummary["jobs"]++
						totalReplaced++
					}
				}
			}
		}

		// 5. Registrations
		var registrations []models.Registration
		if err := tx.Find(&registrations).Error; err == nil {
			for _, r := range registrations {
				newReceipt, ch := replaceString(r.ReceiptURL)
				if ch {
					if err := tx.Model(&models.Registration{}).Where("id = ?", r.ID).Update("receipt_url", newReceipt).Error; err == nil {
						affectedSummary["registrations"]++
						totalReplaced++
					}
				}
			}
		}

		// 6. Custom HTML Pages
		var customPages []models.CustomPage
		if err := tx.Find(&customPages).Error; err == nil {
			for _, cp := range customPages {
				newContent, ch := replaceString(cp.HTMLContent)
				if ch {
					if err := tx.Model(&models.CustomPage{}).Where("id = ?", cp.ID).Update("html_content", newContent).Error; err == nil {
						affectedSummary["custom_pages"]++
						totalReplaced++
					}
				}
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در اعمال تغییرات در پایگاه داده: " + err.Error()})
		return
	}

	// Update Static files in codebase if requested
	if shouldUpdateFiles {
		root := locateProjectRoot()
		filesToUpdate := []string{
			"constants.ts",
			"arvanconstan.ts",
			"backend/internal/database/seeds/members.json",
			"backend/internal/database/seeds/programs.json",
			"backend/internal/database/seeds/courses.json",
			"backend/internal/database/seeds/jobs.json",
		}

		for _, rel := range filesToUpdate {
			p := filepath.Join(root, rel)
			data, err := os.ReadFile(p)
			if err == nil {
				text := string(data)
				updatedText, changed := replaceString(text)
				if changed {
					if writeErr := os.WriteFile(p, []byte(updatedText), 0644); writeErr == nil {
						affectedSummary[filepath.Base(rel)]++
						totalReplaced++
					}
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "جایگزینی لینک‌ها با موفقیت انجام شد",
		"replacedCount":  totalReplaced,
		"affected":       affectedSummary,
		"mappingsCount": len(replaceMap),
	})
}
