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
	seedForms(db)
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

func seedForms(db *gorm.DB) {
	var count int64
	db.Model(&models.PorslineForm{}).Count(&count)
	if count > 0 {
		return
	}

	sampleForms := []models.PorslineForm{
		{
			Title:          "نظرسنجی کیفیت کارگاه‌ها و برنامه‌های انجمن علمی",
			Description:    "لطفاً نظرات و پیشنهادات ارزشمند خود را جهت ارتقای سطح رویدادها و دوره‌های آموزشی انجمن با ما به اشتراک بگذارید.",
			Type:           "survey",
			Status:         "active",
			Slug:           "events-feedback",
			IsPublic:       true,
			AllowMultiple:  true,
			SuccessMessage: "از همراهی و بازخورد ارزشمند شما سپاسگزاریم!",
			Questions: []models.FormQuestion{
				{
					ID:          "q_name",
					Title:       "نام و نام خانوادگی (اختیاری)",
					Type:        "text",
					Required:    false,
					Placeholder: "مثال: علی رضایی",
					Order:       1,
				},
				{
					ID:          "q_program",
					Title:       "در کدام یک از رویدادهای اخیر انجمن حضور داشتید؟",
					Type:        "radio",
					Required:    true,
					Options:     []string{"کارگاه تخصصی یادگیری ماشین و هوش مصنوعی", "بوت‌کمپ جامع توسعه وب", "سمینار معماری نرم‌افزار", "دورهمی هفتگی انتقال تجربه"},
					Order:       2,
				},
				{
					ID:          "q_rating",
					Title:       "میزان رضایت کلی شما از محتوا و نحوه برگزاری رویداد چگونه بود؟",
					Type:        "rating",
					Required:    true,
					Description: "امتیاز از ۱ (ضعیف) تا ۵ (عالی)",
					Order:       3,
				},
				{
					ID:          "q_scale",
					Title:       "چقدر احتمال دارد شرکت در این رویدادها را به دوستان و هم‌دانشگاهی‌های خود پیشنهاد دهید؟",
					Type:        "scale",
					Required:    true,
					Description: "امتیاز بین ۱ تا ۱۰",
					Order:       4,
				},
				{
					ID:          "q_topics",
					Title:       "کدام موضوعات را برای برنامه‌های آینده انجمن بیشتر ترجیح می‌دهید؟",
					Type:        "checkbox",
					Required:    false,
					Options:     []string{"برنامه‌نویسی Go و میکروسرویس‌ها", "طراحی رابط کاربری و UI/UX", "امنیت سایبری و تست نفوذ", "آشنایی با بازار کار و رزومه‌نویسی"},
					Order:       5,
				},
				{
					ID:          "q_collaborate",
					Title:       "آیا تمایل دارید در برگزاری برنامه‌های بعدی به عنوان همکار اجرایی به تیم ما بپیوندید؟",
					Type:        "boolean",
					Required:    true,
					Order:       6,
				},
				{
					ID:          "q_feedback",
					Title:       "نظرات، انتقادات یا پیشنهادات تکمیلی خود را بنویسید:",
					Type:        "textarea",
					Required:    false,
					Placeholder: "نکات مورد نظر خود را اینجا بنویسید...",
					Order:       7,
				},
			},
		},
		{
			Title:          "آزمون آنلاین مفاهیم پایه‌ای برنامه‌نویسی و وب",
			Description:    "کوییز چندگزینه‌ای سنجش اطلاعات عمومی مهندسی کامپیوتر و وب (با محاسبه آنی نمره)",
			Type:           "quiz",
			Status:         "active",
			Slug:           "web-quiz",
			IsPublic:       true,
			AllowMultiple:  false,
			SuccessMessage: "آزمون شما با موفقیت پایان یافت و نمره شما محاسبه شد.",
			TimeLimitMin:   15,
			Questions: []models.FormQuestion{
				{
					ID:          "qz_name",
					Title:       "نام و شماره دانشجویی شرکت‌کننده",
					Type:        "text",
					Required:    true,
					Placeholder: "نام و شماره دانشجویی",
					Order:       1,
				},
				{
					ID:            "qz_1",
					Title:         "کدام پروتکل برای انتقال امن اطلاعات در بستر وب رمزنگاری شده استفاده می‌شود؟",
					Type:          "radio",
					Required:      true,
					Options:       []string{"HTTP", "HTTPS", "FTP", "SMTP"},
					CorrectAnswer: "HTTPS",
					Points:        5,
					Order:         2,
				},
				{
					ID:            "qz_2",
					Title:         "کدام کد وضعیت HTTP نشان‌دهنده موفقیت درخواست (OK) است؟",
					Type:          "radio",
					Required:      true,
					Options:       []string{"200", "404", "500", "301"},
					CorrectAnswer: "200",
					Points:        5,
					Order:         3,
				},
				{
					ID:            "qz_3",
					Title:         "عبارت DOM در جاوااسکریپت مخفف کدام گزینه است؟",
					Type:          "select",
					Required:      true,
					Options:       []string{"Document Object Model", "Data Operating Mechanism", "Digital Object Method"},
					CorrectAnswer: "Document Object Model",
					Points:        10,
					Order:         4,
				},
			},
		},
	}

	if err := db.Create(&sampleForms).Error; err != nil {
		log.Printf("Failed to seed sample forms: %v", err)
	} else {
		log.Printf("Seeded %d sample Porsline forms", len(sampleForms))
	}
}

