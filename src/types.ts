export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  college: string;
  year: string;
  branch: string;
  bio: string;
  avatarColor: string;
  avatarUrl?: string;
  canTeach: string[];
  wantToLearn: string[];
  rating: number;
  ratingCount: number;
  joinedAt: string;
}

export interface Request {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  type: 'learning' | 'project';
  portfolioLink?: string;
  createdAt: string;
  isRated?: boolean;
}

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  requestId: string;
  stars: number;
  review: string;
  createdAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  techStack: string[];
  rolesNeeded: string[];
  githubUrl?: string;
  liveUrl?: string;
  createdAt: string;
}

export type PageId = 'landing' | 'signup' | 'login' | 'browse' | 'profile' | 'edit-profile' | 'requests' | 'view-profile' | 'open-projects';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
