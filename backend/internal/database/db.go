package database

import (
	"log"
	"os"
	"path/filepath"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"uisace-backend/config"
	"uisace-backend/internal/models"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) *gorm.DB {
	dir := filepath.Dir(cfg.DBPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Fatalf("Failed to create database directory: %v", err)
	}

	db, err := gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run auto migrations
	err = db.AutoMigrate(
		&models.User{},
		&models.Member{},
		&models.Program{},
		&models.Course{},
		&models.Job{},
		&models.Registration{},
		&models.ContactMessage{},
	)
	if err != nil {
		log.Fatalf("Failed to auto migrate database: %v", err)
	}

	DB = db
	log.Println("Database migrated successfully")

	// Seed default admin and initial data if empty
	SeedData(db, cfg)

	return db
}
