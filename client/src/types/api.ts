export type Role = 'STUDENT' | 'ADMIN';
export type QuestCategory = 'EXPLORE' | 'ACADEMICS' | 'SOCIAL' | 'WELLNESS';
export type VerificationType = 'QR' | 'MANUAL';
export type QuestStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type StudentQuestStatus = 'LOCKED' | 'AVAILABLE' | 'PENDING' | 'COMPLETED';
export type CheckInStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type CheckInMethod = 'QR' | 'MANUAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  lifetimePoints: number;
  pointsBalance: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  locationHint: string;
  pointValue: number;
  category: QuestCategory;
  verificationType: VerificationType;
  status: QuestStatus;
  prerequisiteQuestId?: string | null;
  prerequisiteQuest?: { id: string; title: string } | null;
  studentStatus?: StudentQuestStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    checkIns: number;
  };
  qrCodes?: QRCode[];
}

export interface QRCode {
  id: string;
  questId: string;
  token: string;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  questId: string;
  status: CheckInStatus;
  method: CheckInMethod;
  note?: string | null;
  verifiedById?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  quest?: {
    id: string;
    title: string;
    pointValue: number;
    category: QuestCategory;
  };
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  stock: number;
  active: boolean;
  createdAt: string;
  _count?: {
    redemptions: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  lifetimePoints: number;
  completedQuestsCount: number;
  latestVerifiedAt: string | null;
}

export interface LeaderboardResponse {
  topStudents: LeaderboardEntry[];
  totalParticipants: number;
  myRank: LeaderboardEntry | null;
}

export interface ProgressResponse {
  user: User;
  points: {
    lifetimePoints: number;
    pointsBalance: number;
  };
  stats: {
    totalPublishedQuests: number;
    completedCount: number;
    remainingCount: number;
    completionPercentage: number;
  };
  completedQuests: {
    checkInId: string;
    questId: string;
    title: string;
    pointValue: number;
    category: QuestCategory;
    method: CheckInMethod;
    verifiedAt: string;
  }[];
  remainingQuests: Quest[];
}

export interface AdminStatsResponse {
  overview: {
    totalStudents: number;
    totalQuests: number;
    totalCheckIns: number;
    pendingVerifications: number;
    totalRedemptions: number;
  };
  questAnalytics: {
    id: string;
    title: string;
    category: QuestCategory;
    pointValue: number;
    verifiedCount: number;
    completionRate: number;
  }[];
}
