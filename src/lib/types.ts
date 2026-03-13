export interface AppSettings {
  openaiApiKey: string;
  anthropicApiKey: string;
  youtubeApiKey: string;
  defaultModel: 'openai' | 'anthropic';
}

export interface Client {
  id: string;
  name: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSettings {
  clientId: string;
  // Business Info
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  city: string;
  state: string;
  zip: string;
  website: string;

  // GBP Data
  gbpRawData: string;
  gbpPrimaryCategory: string;
  gbpSecondaryCategories: string[];
  gbpServices: GBPService[];

  // Voice & Tone
  voiceTone: string;
  wordsToUse: string[];
  wordsToAvoid: string[];
  targetAudience: string;
  writingSamples: string;

  // Review Data
  averageRating: number;
  reviewCount: number;
  reviewSourceUrl: string;

  // Local Details
  localDetails: string;

  // Image Preferences
  imageStylePreference: string;

  // WordPress Connection
  wpSiteUrl: string;
  wpUsername: string;
  wpAppPassword: string;
}

export interface GBPService {
  name: string;
  category: string;
  hasPage: boolean;
  pageUrl?: string;
}

export interface GBPAuditResult {
  clientId: string;
  primaryCategory: string;
  city: string;
  suggestedCategories: string[];
  entityAnalysis: EntityAnalysis[];
  createdAt: string;
}

export type EntityAnalysisItem = EntityAnalysis;

export interface EntityAnalysis {
  service: string;
  isDistinctEntity: boolean;
  overlapsWith: string[];
  recommendation: string;
}

export interface CrawlResult {
  clientId: string;
  url: string;
  pages: CrawledPage[];
  crawledAt: string;
}

export interface CrawledPage {
  url: string;
  title: string;
  h1: string;
  metaDescription: string;
  wordCount: number;
  assignedService: string;
  assignedCategory: string;
  manualOverride: boolean;
  internalLinks: string[];
}

export interface GapAnalysisResult {
  clientId: string;
  missingServices: string[];
  missingCategories: string[];
  contentPlan: ContentPlanItem[];
  createdAt: string;
}

export interface ContentPlanItem {
  service: string;
  category: string;
  targetKeyword: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'generated' | 'published';
}

export interface GeneratedContent {
  id: string;
  clientId: string;
  service: string;
  category: string;
  targetKeyword: string;
  city: string;
  title: string;
  content: string;
  outline: string;
  schemaMarkup: string;
  images: GeneratedImage[];
  wordCount: number;
  status: 'outline' | 'draft' | 'final' | 'published';
  passesCompleted: number;
  wpPostId?: number;
  wpUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  altText: string;
  createdAt: string;
}

export interface ContentGenerationOptions {
  services: string[];
  city: string;
  imagesPerPage: number;
  videoEveryNth: number;
  autoHumanize: boolean;
  autoPublish: boolean;
  approveOutlines: boolean;
}

export interface ActivityLogEntry {
  id: string;
  clientId?: string;
  action: string;
  details: string;
  timestamp: string;
  status: 'info' | 'success' | 'error' | 'warning';
}
