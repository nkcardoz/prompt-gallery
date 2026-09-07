import React from 'react';
import {
  Sparkles,
  Terminal,
  Bot,
  Zap,
  Layers,
  Image as ImageIcon,
  FileCode2,
  FileText,
  ListTree,
  CheckSquare,
  BookOpen,
  Wrench,
  Bookmark,
  Heart,
  Eye,
  Copy,
  Share2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ResourceItem, ResourceType } from '../types';

interface ResourceCardProps {
  resource: ResourceItem;
  onOpen: (resource: ResourceItem) => void;
  onLike?: (resourceId: string, e: React.MouseEvent) => void;
  onBookmark?: (resource: ResourceItem, e: React.MouseEvent) => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export const RESOURCE_TYPE_CONFIG: Record<
  ResourceType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  prompt: { label: 'Prompt', icon: Sparkles, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  agent: { label: 'AI Agent', icon: Bot, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  automation: { label: 'Automation', icon: Zap, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  workflow: { label: 'Workflow', icon: Layers, color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  template: { label: 'Template', icon: FileCode2, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  image_prompt: { label: 'Image Prompt', icon: ImageIcon, color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  snippet: { label: 'Snippet', icon: Terminal, color: 'bg-slate-500/10 text-slate-700 border-slate-500/20' },
  document: { label: 'Document', icon: FileText, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  list: { label: 'Curated List', icon: ListTree, color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  form: { label: 'Input Form', icon: CheckSquare, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  knowledge: { label: 'Knowledge Base', icon: BookOpen, color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  tool: { label: 'AI Tool', icon: Wrench, color: 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20' }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onOpen,
  onLike,
  onBookmark,
  isLiked = false,
  isBookmarked = false
}) => {
  const typeConfig = RESOURCE_TYPE_CONFIG[resource.type] || RESOURCE_TYPE_CONFIG.prompt;
  const IconComponent = typeConfig.icon;

  return (
    <div
      id={`resource-card-${resource.id}`}
      onClick={() => onOpen(resource)}
      className="group relative flex flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-4.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Card Header: Type Badge & Quick Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeConfig.color}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span>{typeConfig.label}</span>
          </span>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
            {resource.aiModel && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                {resource.aiModel}
              </span>
            )}
            <button
              id={`bookmark-btn-${resource.id}`}
              title="Bookmark resource"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark?.(resource, e);
              }}
              className={`p-1.5 rounded-md hover:bg-stone-100 transition-colors ${
                isBookmarked ? 'text-amber-500' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Thumbnail (if present) */}
        {resource.thumbnail && (
          <div className="mb-3.5 overflow-hidden rounded-lg bg-stone-100 aspect-video w-full">
            <img
              src={resource.thumbnail}
              alt={resource.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
              loading="lazy"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-stone-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
          {resource.shortDescription || resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-stone-600 bg-stone-100/80 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-[10px] text-stone-400 px-1 py-0.5">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Creator and stats */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={
              resource.authorAvatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${resource.authorId}`
            }
            alt={resource.authorName}
            className="w-5 h-5 rounded-full object-cover bg-stone-200 flex-shrink-0"
          />
          <span className="font-medium text-stone-700 truncate text-[11px]">
            {resource.authorName}
          </span>
          {resource.verified && (
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" title="Verified Creator" />
          )}
        </div>

        <div className="flex items-center gap-3 text-stone-400">
          <span className="inline-flex items-center gap-1 text-[11px]" title="Views">
            <Eye className="w-3.5 h-3.5" />
            <span>{resource.views || 0}</span>
          </span>

          <button
            id={`like-btn-${resource.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(resource.id, e);
            }}
            className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
              isLiked ? 'text-rose-500 font-medium' : 'hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{resource.likesCount || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
