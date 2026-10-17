package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"uisace-backend/config"
	"uisace-backend/internal/middleware"
	"uisace-backend/internal/models"
)

type AuthHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "نام کاربری و رمز عبور الزامی است"})
		return
	}

	var user models.User
	if err := h.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "نام کاربری یا رمز عبور اشتباه است"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "نام کاربری یا رمز عبور اشتباه است"})
		return
	}

	// Generate JWT
	claims := middleware.Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در صدور توکن"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token: tokenString,
		User:  user,
	})
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "عدم دسترسی"})
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "کاربر یافت نشد"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) GetUsers(c *gin.Context) {
	var users []models.User
	if err := h.db.Select("id, username, role, created_at, updated_at").Order("id ASC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در دریافت لیست کاربران"})
		return
	}

	c.JSON(http.StatusOK, users)
}

type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=4"`
	Role     string `json:"role"`
}

func (h *AuthHandler) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "اطلاعات ارسالی نامعتبر است (رمز عبور باید حداقل ۴ کاراکتر باشد)"})
		return
	}

	var count int64
	h.db.Model(&models.User{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "کاربری با این نام کاربری قبلاً وجود دارد"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ساخت رمز عبور"})
		return
	}

	role := req.Role
	if role == "" {
		role = "admin"
	}

	newUser := models.User{
		Username: req.Username,
		Password: string(hashed),
		Role:     role,
	}

	if err := h.db.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در ایجاد کاربر"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":        newUser.ID,
		"username":  newUser.Username,
		"role":      newUser.Role,
		"createdAt": newUser.CreatedAt,
	})
}

func (h *AuthHandler) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه کاربر نامعتبر است"})
		return
	}

	currentUserIDVal, exists := c.Get("userID")
	if exists {
		if uid, ok := currentUserIDVal.(uint); ok && uid == uint(id) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "شما نمی‌توانید حساب کاربری فعلی خودتان را حذف کنید"})
			return
		}
	}

	var count int64
	h.db.Model(&models.User{}).Count(&count)
	if count <= 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "حذف تنها مدیر سیستم مجاز نیست"})
		return
	}

	if err := h.db.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در حذف کاربر"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "کاربر با موفقیت حذف شد"})
}

type UpdatePasswordRequest struct {
	Password string `json:"password" binding:"required,min=4"`
}

func (h *AuthHandler) UpdateUserPassword(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "شناسه کاربر نامعتبر است"})
		return
	}

	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "رمز عبور جدید باید حداقل ۴ کاراکتر باشد"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در پردازش رمز عبور"})
		return
	}

	if err := h.db.Model(&models.User{}).Where("id = ?", id).Update("password", string(hashed)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "خطا در بروزرسانی رمز عبور"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "رمز عبور با موفقیت تغییر یافت"})
}

