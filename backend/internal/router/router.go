package router

import (
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"uisace-backend/config"
	"uisace-backend/internal/handlers"
	"uisace-backend/internal/middleware"
)

func SetupRouter(db *gorm.DB, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Apply CORS
	r.Use(middleware.CORSMiddleware())

	// Ensure upload directory exists and serve static uploads
	_ = os.MkdirAll(cfg.UploadDir, 0755)
	r.Static("/uploads", cfg.UploadDir)

	// Handlers initialization
	authHandler := handlers.NewAuthHandler(db, cfg)
	programHandler := handlers.NewProgramHandler(db)
	memberHandler := handlers.NewMemberHandler(db)
	courseHandler := handlers.NewCourseHandler(db)
	jobHandler := handlers.NewJobHandler(db)
	registrationHandler := handlers.NewRegistrationHandler(db, cfg)
	contactHandler := handlers.NewContactHandler(db)
	statsHandler := handlers.NewStatsHandler(db)
	uploadHandler := handlers.NewUploadHandler(cfg)
	formHandler := handlers.NewFormHandler(db, cfg)
	customPageHandler := handlers.NewCustomPageHandler(db)
	mediaLinksHandler := handlers.NewMediaLinksHandler(db, cfg)
	certificateHandler := handlers.NewCertificateHandler(db)
	promoCodeHandler := handlers.NewPromoCodeHandler(db)

	// API Root Route Group
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "ok",
				"message": "UISACE Go Backend is running smoothly",
			})
		})

		// Public Routes
		api.POST("/auth/login", authHandler.Login)
		api.GET("/stats", statsHandler.GetStats)

		// Programs
		api.GET("/programs", programHandler.GetPrograms)
		api.GET("/programs/:id", programHandler.GetProgramByID)

		// Members
		api.GET("/members", memberHandler.GetMembers)
		api.GET("/members/:id", memberHandler.GetMemberByID)

		// Courses
		api.GET("/courses", courseHandler.GetCourses)
		api.GET("/courses/:id", courseHandler.GetCourseByID)

		// Jobs
		api.GET("/jobs", jobHandler.GetJobs)
		api.GET("/jobs/settings", jobHandler.GetJobSettings)
		api.GET("/jobs/:id", jobHandler.GetJobByID)

		// Porsline Public Forms
		api.GET("/forms", formHandler.GetPublicForms)
		api.GET("/forms/:id", formHandler.GetFormByIDOrSlug)
		api.POST("/forms/:id/submit", formHandler.SubmitForm)
		api.POST("/forms/upload", formHandler.UploadAttachment)

		// Custom Pages Public Routes
		api.GET("/custom-pages/by-slug", customPageHandler.GetPublicPageBySlug)
		api.GET("/custom-pages/render/*slug", customPageHandler.RenderPageBySlug)

		// Certificates Verification
		api.GET("/certificates/verify", certificateHandler.VerifyCertificate)
		api.GET("/certificates/:id", certificateHandler.GetCertificateByID)

		// Promo Codes Validation
		api.POST("/promo-codes/validate", promoCodeHandler.ValidatePromoCode)

		// User Submissions
		api.POST("/registrations", registrationHandler.CreateRegistration)
		api.POST("/contact", contactHandler.CreateContactMessage)

		// Admin Protected Routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg))
		{
			admin.GET("/me", authHandler.GetMe)
			admin.POST("/upload", uploadHandler.UploadFile)

			// Admin File Management (Uploads folder)
			admin.GET("/files", uploadHandler.ListFiles)
			admin.POST("/files", uploadHandler.UploadMultipleFiles)
			admin.DELETE("/files", uploadHandler.DeleteFile)
			admin.PUT("/files/rename", uploadHandler.RenameFile)
			admin.POST("/files/replace", uploadHandler.ReplaceFile)

			// Admin Users Management
			admin.GET("/users", authHandler.GetUsers)
			admin.POST("/users", authHandler.CreateUser)
			admin.DELETE("/users/:id", authHandler.DeleteUser)
			admin.PUT("/users/:id/password", authHandler.UpdateUserPassword)

			// Admin Programs CRUD
			admin.POST("/programs", programHandler.CreateProgram)
			admin.PUT("/programs/:id", programHandler.UpdateProgram)
			admin.DELETE("/programs/:id", programHandler.DeleteProgram)

			// Admin Members CRUD
			admin.POST("/members", memberHandler.CreateMember)
			admin.PUT("/members/:id", memberHandler.UpdateMember)
			admin.DELETE("/members/:id", memberHandler.DeleteMember)

			// Admin Courses CRUD
			admin.POST("/courses", courseHandler.CreateCourse)
			admin.PUT("/courses/:id", courseHandler.UpdateCourse)
			admin.DELETE("/courses/:id", courseHandler.DeleteCourse)

			// Admin Jobs CRUD
			admin.GET("/jobs/settings", jobHandler.GetJobSettings)
			admin.PUT("/jobs/settings", jobHandler.UpdateJobSettings)
			admin.POST("/jobs", jobHandler.CreateJob)
			admin.PUT("/jobs/:id", jobHandler.UpdateJob)
			admin.PUT("/jobs/:id/toggle", jobHandler.ToggleJobStatus)
			admin.DELETE("/jobs/:id", jobHandler.DeleteJob)

			// Admin Registrations Management
			admin.GET("/registrations", registrationHandler.GetRegistrations)
			admin.GET("/registrations/export", registrationHandler.ExportRegistrationsCSV)
			admin.PATCH("/registrations/:id/status", registrationHandler.UpdateRegistrationStatus)
			admin.DELETE("/registrations/:id", registrationHandler.DeleteRegistration)

			// Admin Certificates Management
			admin.GET("/certificates", certificateHandler.GetAdminCertificates)
			admin.POST("/certificates", certificateHandler.CreateCertificate)
			admin.POST("/certificates/batch", certificateHandler.BatchCreateCertificates)
			admin.PUT("/certificates/:id", certificateHandler.UpdateCertificate)
			admin.PUT("/certificates/:id/toggle", certificateHandler.ToggleCertificateStatus)
			admin.DELETE("/certificates/:id", certificateHandler.DeleteCertificate)

			// Admin Promo Codes Management
			admin.GET("/promo-codes", promoCodeHandler.GetAdminPromoCodes)
			admin.POST("/promo-codes", promoCodeHandler.CreateAdminPromoCode)
			admin.PUT("/promo-codes/:id", promoCodeHandler.UpdateAdminPromoCode)
			admin.PUT("/promo-codes/:id/toggle", promoCodeHandler.ToggleAdminPromoCode)
			admin.DELETE("/promo-codes/:id", promoCodeHandler.DeleteAdminPromoCode)

			// Admin Contact Messages Management
			admin.GET("/contact", contactHandler.GetContactMessages)
			admin.PATCH("/contact/:id/status", contactHandler.UpdateContactStatus)
			admin.DELETE("/contact/:id", contactHandler.DeleteContactMessage)

			// Admin Porsline Forms Management
			admin.GET("/forms", formHandler.GetAdminForms)
			admin.GET("/forms/:id", formHandler.GetAdminFormByID)
			admin.POST("/forms", formHandler.CreateForm)
			admin.PUT("/forms/:id", formHandler.UpdateForm)
			admin.DELETE("/forms/:id", formHandler.DeleteForm)
			admin.GET("/forms/:id/responses", formHandler.GetFormResponses)
			admin.DELETE("/forms/responses/:responseId", formHandler.DeleteFormResponse)

			// Admin Custom HTML Pages Management
			admin.GET("/custom-pages", customPageHandler.GetAdminPages)
			admin.GET("/custom-pages/:id", customPageHandler.GetAdminPageByID)
			admin.POST("/custom-pages", customPageHandler.CreatePage)
			admin.PUT("/custom-pages/:id", customPageHandler.UpdatePage)
			admin.DELETE("/custom-pages/:id", customPageHandler.DeletePage)

			// Admin Media Links Manager & Replacement
			admin.GET("/media-links", mediaLinksHandler.GetAllMediaLinks)
			admin.POST("/media-links/replace", mediaLinksHandler.ReplaceMediaLinks)
			admin.GET("/media-links/export", mediaLinksHandler.ExportMediaLinksTxt)
		}
	}

	return r
}
