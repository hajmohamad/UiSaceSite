package config

import (
	"os"
	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	DBPath        string
	JWTSecret     string
	AdminUsername string
	AdminPassword string
	UploadDir     string
	BaseURL       string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	port := getEnv("PORT", "8080")
	dbPath := getEnv("DB_PATH", "./data/uisace.db")
	jwtSecret := getEnv("JWT_SECRET", "uisace-super-secret-key-change-in-production-2026")
	adminUser := getEnv("ADMIN_USERNAME", "admin")
	adminPass := getEnv("ADMIN_PASSWORD", "admin123")
	uploadDir := getEnv("UPLOAD_DIR", "./uploads")
	baseURL := getEnv("BASE_URL", "http://localhost:8080")

	return &Config{
		Port:          port,
		DBPath:        dbPath,
		JWTSecret:     jwtSecret,
		AdminUsername: adminUser,
		AdminPassword: adminPass,
		UploadDir:     uploadDir,
		BaseURL:       baseURL,
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
