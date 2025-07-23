export interface Educator {
  id: string;
  email: string;
  name: string;
  bio?: string;
  specialties: string[];
  contactEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Practice {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  learningLevel: 'basic' | 'standard' | 'advanced';
  specialNeeds: boolean;
  implementationDate: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  educatorId: string;
  educator?: Educator;
  materials?: Media[];
  comments?: Comment[];
  ratings?: Rating[];
  _count?: {
    comments: number;
    ratings: number;
  };
  averageRating?: number;
  ratingsCount?: number;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  practiceId: string;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  practiceId: string;
}

export interface Rating {
  id: string;
  score: number;
  createdAt: string;
  practiceId: string;
}

export interface Contact {
  id: string;
  parentName: string;
  parentEmail: string;
  childAge: number;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
  practiceId: string;
  practice?: Practice;
}