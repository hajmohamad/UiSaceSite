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

// Program represents an event or program organized by the association
type Program struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	Title            string         `gorm:"not null" json:"title"`
	Date             string         `json:"date"`
	DateISO          string         `json:"dateISO"`
	ShortDescription string         `json:"shortDescription"`
	FullDescription  string         `json:"fullDescription"`
	ImageURL         string         `json:"imageUrl"`
	Price            *float64       `json:"price,omitempty"`
	Status           string         `gorm:"default:'upcoming'" json:"status"` // upcoming | past
	RegistrationLink string         `json:"registrationLink,omitempty"`
	Collaborators    []int          `gorm:"serializer:json" json:"collaborators"`
	Sponsors         []Sponsor      `gorm:"serializer:json" json:"sponsors"`
	Gallery          ProgramGallery `gorm:"serializer:json" json:"gallery"`
	RegisteredCount  int            `gorm:"default:0" json:"registeredCount"`
	DurationHours    int            `gorm:"default:0" json:"durationHours"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
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
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
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
	ReceiptURL    string    `json:"receiptUrl,omitempty"`
	Status        string    `gorm:"default:'pending'" json:"status"` // pending | approved | rejected
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
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
