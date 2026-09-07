export type ResourceType =
  | 'prompt'
  | 'agent'
  | 'automation'
  | 'workflow'
  | 'template'
  | 'image_prompt'
  | 'snippet'
  | 'document'
  | 'list'
  | 'form'
  | 'knowledge'
  | 'tool';

export type ResourceStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
export type ResourceVisibility = 'public' | 'unlisted' | 'private';

export interface PromptVariable {
  name: string;
  label?: string;
  defaultValue?: string;
  description?: string;
}

export interface ResourceItem {
  id: string;
  type: ResourceType;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  content: string;
  thumbnail?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorUsername?: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  status: ResourceStatus;
  visibility: ResourceVisibility;
  featured: boolean;
  verified: boolean;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  views: number;
  likesCount: number;
  copiesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  searchKeywords?: string[];
  // Optional fields
  aiModel?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  toolsRequired?: string[];
  instructions?: string;
  variables?: PromptVariable[];
  examples?: string[];
  steps?: string[];
  inputSchema?: string;
  outputExample?: string;
  version?: string;
  pricing?: 'free' | 'freemium' | 'paid';
  externalUrl?: string;
}

export type UserRole = 'user' | 'creator' | 'admin' | 'moderator';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  bio?: string;
  role: UserRole;
  status?: 'active' | 'suspended';
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    youtube?: string;
  };
  stats?: {
    totalResources?: number;
    totalViews?: number;
    totalLikes?: number;
    totalCopies?: number;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  order: number;
  active: boolean;
  createdAt: number;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
  createdAt: number;
}

export interface CommentItem {
  id: string;
  resourceId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorUsername?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroSearchPlaceholder: string;
  featuredResourceIds: string[];
  trendingResourceIds: string[];
  sectionsOrder: string[];
  visibleSections: {
    hero: boolean;
    categories: boolean;
    featured: boolean;
    trending: boolean;
    agents: boolean;
    automations: boolean;
    creators: boolean;
    latest: boolean;
  };
  sectionTitles: {
    featured: string;
    trending: string;
    agents: string;
    automations: string;
    creators: string;
    latest: string;
  };
  ctaText?: string;
  ctaLink?: string;
}
