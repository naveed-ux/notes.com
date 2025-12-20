
export enum Category {
  SCIENCE = 'Science',
  MATH = 'Mathematics',
  HISTORY = 'History',
  PROGRAMMING = 'Programming',
  BUSINESS = 'Business',
  LITERATURE = 'Literature',
  OTHER = 'Other'
}

export interface Note {
  id: string;
  title: string;
  description: string;
  content: string;
  pdfUrl?: string;
  author: string;
  price: number;
  category: Category;
  rating: number;
  ratingCount: number; // New field for average calculation
  tags: string[];
  createdAt: string;
  isFree: boolean;
  thumbnailUrl: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  purchasedNotes: string[];
  uploadedNotes: string[];
  password?: string;
}
