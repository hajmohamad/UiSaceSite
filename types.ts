
export interface Membership {
  year: number;
  position: string;
}

export interface Member {
  id: number;
  name: string;
  memberships: Membership[];
  imageUrl: string;
  bio: string;
}

export interface Sponsor {
  id: number;
  name: string;
  logoUrl: string;
}

export interface Program {
   price?: number;  
  id: number;
  title: string;
  date: string;
  dateISO: string; // For accurate sorting
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  collaborators: number[]; // Array of member IDs
  sponsors: Sponsor[];
  status: 'upcoming' | 'past';
  registrationLink?: string; // Kept for potential external links
  gallery?: {
    images: string[];
    videos: string[]; // URLs for video embeds
  };
  registeredCount?: number; // New property for number of registered participants
  durationHours?: number; // New property for program duration in hours
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: string
  salary?: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  expiryDate: string; // ISO string format
}


export interface CourseVideo {
  id: number;
  title: string;
  url: string; // e.g., YouTube embed URL
}

export interface CourseFile {
  id: number;
  name: string;
  url: string; // Direct download link
  type: 'PDF' | 'ZIP' | 'Image';
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  videos: CourseVideo[];
  files: CourseFile[];
  isPaid: boolean;
  price?: number;
}
