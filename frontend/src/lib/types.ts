export type Platform = "LinkedIn" | "X" | "Instagram";

export type PostStatus = "draft" | "scheduled" | "published";

export type Tone =
  | "Confident & informative"
  | "Friendly & conversational"
  | "Bold & provocative"
  | "Warm & personal";

export type Audience =
  | "Founders & marketers"
  | "Developers & engineers"
  | "General audience"
  | "Existing customers";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Post {
  _id: string;
  user: string;
  topic: string;
  platform: Platform;
  tone: string;
  audience: string;
  content: string;
  status: PostStatus;
  scheduledAt?: string;
  autoRegenerate: boolean;
  usedFallback: boolean;
  publishedAt?: string;
  mediaUrl?: string;
  postedToRealPlatform: boolean;
  externalPostError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  _id: string;
  platform: Platform;
  username: string;
  platformUserId: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Credits {
  credits: number;
  monthlyCreditAllowance: number;
}

export const PLATFORMS: Platform[] = ["LinkedIn", "X", "Instagram"];

export const TONES: Tone[] = [
  "Confident & informative",
  "Friendly & conversational",
  "Bold & provocative",
  "Warm & personal",
];

export const AUDIENCES: Audience[] = [
  "Founders & marketers",
  "Developers & engineers",
  "General audience",
  "Existing customers",
];
