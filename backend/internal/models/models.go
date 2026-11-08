package models

import (
	"time"
)

// Membership represents membership records for a member in a specific year
type Membership struct {
	Year     int    `json:"year"`
	Position string `json:"position"`
}

// Member represents an association member
type Member struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	Name        string       `gorm:"not null" json:"name"`
	Memberships []Membership `gorm:"serializer:json" json:"memberships"`
	ImageURL    string       `json:"imageUrl"`
	Bio         string       `json:"bio"`
	CreatedAt   time.Time    `json:"createdAt"`
	UpdatedAt   time.Time    `json:"updatedAt"`
}

// Sponsor represents a program sponsor
type Sponsor struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	LogoURL string `json:"logoUrl"`
}

// ProgramGallery represents image and video urls for past programs
type ProgramGallery struct {
	Images []string `json:"images"`
	Videos []string `json:"videos"`
}

// ProgramCollaborator represents a member's role in a specific program
type ProgramCollaborator struct {
	MemberID int    `json:"memberId"`
	Name     string `json:"name,omitempty"`
	Role     string `json:"role"`
	ImageURL string `json:"imageUrl,omitempty"`
}

// Program represents an event or program organized by the association
type Program struct {
	ID                  uint                  `gorm:"primaryKey" json:"id"`
	Title               string                `gorm:"not null" json:"title"`
	Date                string                `json:"date"`
	DateISO             string                `json:"dateISO"`
	ShortDescription    string                `json:"shortDescription"`
	FullDescription     string                `json:"fullDescription"`
	ImageURL            string                `json:"imageUrl"`
	Price               *float64              `json:"price,omitempty"`
	Status              string                `gorm:"default:'upcoming'" json:"status"` // upcoming | past
	RegistrationLink    string                `json:"registrationLink,omitempty"`
	Collaborators       []int                 `gorm:"serializer:json" json:"collaborators"`
	CollaboratorDetails []ProgramCollaborator `gorm:"serializer:json" json:"collaboratorDetails"`
	Sponsors            []Sponsor             `gorm:"serializer:json" json:"sponsors"`
	Gallery             ProgramGallery        `gorm:"serializer:json" json:"gallery"`
	RegisteredCount     int                   `gorm:"default:0" json:"registeredCount"`
	ShowRegisteredCount bool                  `gorm:"default:false" json:"showRegisteredCount"`
	DurationHours       int                   `gorm:"default:0" json:"durationHours"`
	CreatedAt           time.Time             `json:"createdAt"`
	UpdatedAt           time.Time             `json:"updatedAt"`
}

// CourseVideo represents a video item in a course section
type CourseVideo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Type  string `json:"type"` // direct | aparat | google-drive
	URL   string `json:"url"`
}

// CourseFile represents a downloadable file in a course section
type CourseFile struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
	Type string `json:"type"` // PDF | ZIP | Image
}

// CourseSection represents a section in a course
type CourseSection struct {
	ID     int           `json:"id"`
	Title  string        `json:"title"`
	Videos []CourseVideo `json:"videos"`
	Files  []CourseFile  `json:"files"`
}

// Course represents an educational course
type Course struct {
	ID               string          `gorm:"primaryKey" json:"id"`
	Title            string          `gorm:"not null" json:"title"`
	Instructor       string          `json:"instructor"`
	ShortDescription string          `json:"shortDescription"`
	LongDescription  string          `json:"longDescription"`
	ImageURL         string          `json:"imageUrl"`
	Sections         []CourseSection `gorm:"serializer:json" json:"sections"`
	IsPaid           bool            `json:"isPaid"`
	Price            *float64        `json:"price,omitempty"`
	CreatedAt        time.Time       `json:"createdAt"`
	UpdatedAt        time.Time       `json:"updatedAt"`
}

// Job represents a job vacancy
type Job struct {
	ID               string    `gorm:"primaryKey" json:"id"`
	Title            string    `gorm:"not null" json:"title"`
	Company          string    `json:"company"`
	Logo             string    `json:"logo"`
	Location         string    `json:"location"`
	Type             string    `json:"type"`
	Salary           *string   `json:"salary,omitempty"`
	Description      string    `json:"description"`
	Responsibilities []string  `gorm:"serializer:json" json:"responsibilities"`
	Qualifications   []string  `gorm:"serializer:json" json:"qualifications"`
	ExpiryDate       string    `json:"expiryDate"`
	Status           string    `gorm:"default:'active'" json:"status"` // active | stopped
	IsStopped        bool      `gorm:"default:false" json:"isStopped"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// SiteSetting represents general key-value site configurations
type SiteSetting struct {
	Key       string    `gorm:"primaryKey" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// JobFeatureSettings represents configuration for the jobs feature
type JobFeatureSettings struct {
	Enabled        bool   `json:"enabled"`
	StoppedMessage string `json:"stoppedMessage"`
	ContactEmail   string `json:"contactEmail"`
}

// Registration represents participant sign up for a program
type Registration struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ProgramID     uint      `gorm:"not null;index" json:"programId"`
	Program       *Program  `gorm:"foreignKey:ProgramID" json:"program,omitempty"`
	Name          string    `gorm:"not null" json:"name"`
	Phone         string    `gorm:"not null" json:"phone"`
	IsStudent     bool      `json:"isStudent"`
	StudentNumber string    `json:"studentNumber,omitempty"`
	ReceiptURL     string    `json:"receiptUrl,omitempty"`
	Status         string    `gorm:"default:'pending'" json:"status"` // pending | approved | rejected
	PromoCode      string    `json:"promoCode,omitempty"`
	DiscountAmount float64   `gorm:"default:0" json:"discountAmount,omitempty"`
	FinalPrice     float64   `gorm:"default:0" json:"finalPrice,omitempty"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// ContactMessage represents a message sent from the contact form
type ContactMessage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `gorm:"not null" json:"email"`
	Message   string    `gorm:"not null" json:"message"`
	Status    string    `gorm:"default:'unread'" json:"status"` // unread | read | replied
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// User represents an administrator user for the backend
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"not null" json:"-"`
	Role      string    `gorm:"default:'admin'" json:"role"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// FormQuestion represents a question in a Porsline form
type FormQuestion struct {
	ID            string   `json:"id"`
	Title         string   `json:"title"`
	Type          string   `json:"type"` // text, textarea, radio, checkbox, select, rating, scale, boolean, number, email, phone, date, file
	Required      bool     `json:"required"`
	Description   string   `json:"description,omitempty"`
	Placeholder   string   `json:"placeholder,omitempty"`
	Options       []string `json:"options,omitempty"`
	CorrectAnswer string   `json:"correctAnswer,omitempty"`
	Points        int      `json:"points,omitempty"`
	Order         int      `json:"order"`
}

// PorslineForm represents a survey, quiz, registration, or evaluation form
type PorslineForm struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Title          string         `gorm:"not null" json:"title"`
	Description    string         `json:"description"`
	Type           string         `gorm:"default:'survey'" json:"type"` // survey | quiz | registration | evaluation | general
	Status         string         `gorm:"default:'active'" json:"status"` // active | draft | closed
	Slug           string         `gorm:"index" json:"slug,omitempty"`
	IsPublic       bool           `gorm:"default:true" json:"isPublic"`
	AllowMultiple  bool           `gorm:"default:false" json:"allowMultiple"`
	SuccessMessage string         `json:"successMessage,omitempty"`
	TimeLimitMin   int            `gorm:"default:0" json:"timeLimitMin,omitempty"`
	Questions      []FormQuestion `gorm:"serializer:json" json:"questions"`
	ResponseCount  int            `gorm:"default:0" json:"responseCount"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
}

// FormResponse represents a respondent's submission to a Porsline form
type FormResponse struct {
	ID                uint                   `gorm:"primaryKey" json:"id"`
	FormID            uint                   `gorm:"not null;index" json:"formId"`
	Form              *PorslineForm          `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE" json:"form,omitempty"`
	RespondentName    string                 `json:"respondentName,omitempty"`
	RespondentContact string                 `json:"respondentContact,omitempty"`
	Answers           map[string]interface{} `gorm:"serializer:json" json:"answers"`
	Score             *int                   `json:"score,omitempty"`
	MaxScore          *int                   `json:"maxScore,omitempty"`
	IP                string                 `json:"ip,omitempty"`
	CreatedAt         time.Time              `json:"createdAt"`
	UpdatedAt         time.Time              `json:"updatedAt"`
}

// CustomPage represents an uploaded/configured custom HTML page served at a custom URL
type CustomPage struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Slug        string    `gorm:"uniqueIndex;not null" json:"slug"` // Normalized path, e.g. "landing" or "workshop"
	HTMLContent string    `gorm:"type:text;not null" json:"htmlContent"`
	IsActive    bool      `gorm:"default:true" json:"isActive"`
	WithLayout  bool      `gorm:"default:false" json:"withLayout"` // true: inside site layout, false: standalone full page
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Certificate represents an official verifiable digital certificate
type Certificate struct {
	ID              string    `gorm:"primaryKey" json:"id"` // Unique code, e.g. "CERT-SACE-98214"
	StudentName     string    `gorm:"not null" json:"studentName"`
	Gender          string    `json:"gender,omitempty"` // male | female | other
	TitlePrefix     string    `json:"titlePrefix,omitempty"` // e.g. "جناب آقای" or "سرکار خانم"
	NationalID      string    `gorm:"index" json:"nationalId"` // کد ملی
	StudentNumber   string    `gorm:"index" json:"studentNumber"` // شماره دانشجویی
	ProgramTitle    string    `gorm:"not null" json:"programTitle"` // عنوان دوره یا رویداد
	ProgramDate     string    `json:"programDate"` // تاریخ برگزاری
	DurationHours   int       `gorm:"default:0" json:"durationHours"` // ساعت دوره
	Instructor      string    `json:"instructor"` // نام مدرس
	AssociationHead string    `json:"associationHead"` // دبیر انجمن
	Grade           string    `json:"grade,omitempty"` // رتبه یا نمره
	IssueDate       string    `json:"issueDate"` // تاریخ صدور گواهی
	CustomText      string    `gorm:"type:text" json:"customText,omitempty"` // متن اختصاصی گواهینامه
	Status          string    `gorm:"default:'valid'" json:"status"` // valid | revoked
	Description     string    `json:"description,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// PromoCode represents a promotional discount code for registrations
type PromoCode struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Code          string    `gorm:"uniqueIndex;not null" json:"code"` // e.g. "SACE_STUDENT"
	DiscountType  string    `gorm:"default:'percent'" json:"discountType"` // percent | fixed
	DiscountValue float64   `gorm:"not null" json:"discountValue"` // e.g. 20 (for 20%) or 50000 (toman)
	MaxDiscount   *float64  `json:"maxDiscount,omitempty"` // سقف تخفیف برای درصدی
	MaxUses       int       `gorm:"default:0" json:"maxUses"` // 0 = unlimited
	UsedCount     int       `gorm:"default:0" json:"usedCount"`
	ProgramID     *uint     `json:"programId,omitempty"` // null = all programs
	ExpiryDate    string    `json:"expiryDate,omitempty"`
	IsActive      bool      `gorm:"default:true" json:"isActive"`
	Description   string    `json:"description,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}



