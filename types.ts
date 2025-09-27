
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
  id: number;
  title: string;
  date: string;
  dateISO: string; // For accurate sorting
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  collaborators: number[]; // Array of member IDs
  sponsors: Sponsor[];
  participants: number;
  hours: number;
  rating: number;
  status: 'upcoming' | 'past';
  registrationLink?: string; // Kept for potential external links
  gallery?: {
    images: string[];
    videos: string[]; // URLs for video embeds
  };
}
export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'تمام وقت' | 'پاره وقت' | 'پروژه‌ای';
  logo: string;
  description: string;
  tags: string[];
  postedDate: string;
  isExpired?: boolean;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}