package database

import (
	_ "embed"
	"encoding/json"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"uisace-backend/config"
	"uisace-backend/internal/models"
)

//go:embed seeds/members.json
var membersSeedData []byte

//go:embed seeds/programs.json
var programsSeedData []byte

//go:embed seeds/courses.json
var coursesSeedData []byte

//go:embed seeds/jobs.json
var jobsSeedData []byte

func SeedData(db *gorm.DB, cfg *config.Config) {
	seedAdmin(db, cfg)
	seedMembers(db)
	seedPrograms(db)
	seedCourses(db)
	seedJobs(db)
}

func seedAdmin(db *gorm.DB, cfg *config.Config) {
	var count int64
	db.Model(&models.User{}).Where("username = ?", cfg.AdminUsername).Count(&count)
	if count == 0 {
		hashed, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash admin password: %v", err)
			return
		}
		admin := models.User{
			Username: cfg.AdminUsername,
			Password: string(hashed),
			Role:     "admin",
		}
		if err := db.Create(&admin).Error; err != nil {
			log.Printf("Failed to create admin user: %v", err)
		} else {
			log.Printf("Default admin user created: %s", cfg.AdminUsername)
		}
	}
}

func seedMembers(db *gorm.DB) {
	var count int64
	db.Model(&models.Member{}).Count(&count)
	if count > 0 {
		return
	}

	var members []models.Member
	if err := json.Unmarshal(membersSeedData, &members); err != nil {
		log.Printf("Failed to unmarshal members seed: %v", err)
		return
	}

	if err := db.Create(&members).Error; err != nil {
		log.Printf("Failed to seed members: %v", err)
	} else {
		log.Printf("Seeded %d members", len(members))
	}
}

func seedPrograms(db *gorm.DB) {
	var count int64
	db.Model(&models.Program{}).Count(&count)
	if count > 0 {
		return
	}

	var programs []models.Program
	if err := json.Unmarshal(programsSeedData, &programs); err != nil {
		log.Printf("Failed to unmarshal programs seed: %v", err)
		return
	}

	if err := db.Create(&programs).Error; err != nil {
		log.Printf("Failed to seed programs: %v", err)
	} else {
		log.Printf("Seeded %d programs", len(programs))
	}
}

func seedCourses(db *gorm.DB) {
	var count int64
	db.Model(&models.Course{}).Count(&count)
	if count > 0 {
		return
	}

	var courses []models.Course
	if err := json.Unmarshal(coursesSeedData, &courses); err != nil {
		log.Printf("Failed to unmarshal courses seed: %v", err)
		return
	}

	if err := db.Create(&courses).Error; err != nil {
		log.Printf("Failed to seed courses: %v", err)
	} else {
		log.Printf("Seeded %d courses", len(courses))
	}
}

func seedJobs(db *gorm.DB) {
	var count int64
	db.Model(&models.Job{}).Count(&count)
	if count > 0 {
		return
	}

	var jobs []models.Job
	if err := json.Unmarshal(jobsSeedData, &jobs); err != nil {
		log.Printf("Failed to unmarshal jobs seed: %v", err)
		return
	}

	if err := db.Create(&jobs).Error; err != nil {
		log.Printf("Failed to seed jobs: %v", err)
	} else {
		log.Printf("Seeded %d jobs", len(jobs))
	}
}
