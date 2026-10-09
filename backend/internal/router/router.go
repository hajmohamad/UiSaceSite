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
		api.GET("/jobs/:id", jobHandler.GetJobByID)

		// User Submissions
		api.POST("/registrations", registrationHandler.CreateRegistration)
		api.POST("/contact", contactHandler.CreateContactMessage)

		// Admin Protected Routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg))
		{
			admin.GET("/me", authHandler.GetMe)
			admin.POST("/upload", uploadHandler.UploadFile)

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
			admin.POST("/jobs", jobHandler.CreateJob)
			admin.PUT("/jobs/:id", jobHandler.UpdateJob)
			admin.DELETE("/jobs/:id", jobHandler.DeleteJob)

			// Admin Registrations Management
			admin.GET("/registrations", registrationHandler.GetRegistrations)
			admin.PATCH("/registrations/:id/status", registrationHandler.UpdateRegistrationStatus)
			admin.DELETE("/registrations/:id", registrationHandler.DeleteRegistration)

			// Admin Contact Messages Management
			admin.GET("/contact", contactHandler.GetContactMessages)
			admin.PATCH("/contact/:id/status", contactHandler.UpdateContactStatus)
			admin.DELETE("/contact/:id", contactHandler.DeleteContactMessage)
		}
	}

	return r
}
