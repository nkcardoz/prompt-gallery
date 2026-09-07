import React, { useState, useEffect } from 'react';
import {
  Heart,
  Bookmark,
  Share2,
  Copy,
  Check,
  Eye,
  Calendar,
  Layers,
  ArrowLeft,
  ShieldCheck,
  Send,
  Trash2,
  Sparkles,
  Cpu,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ResourceItem, CommentItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  trackResourceView,
  trackResourceCopy,
  toggleLike,
  checkIsLiked,
  toggleBookmark,
  checkIsBookmarked,
  getResourceComments,
  addComment,
  deleteComment
} from '../lib/db';
import { PromptViewer } from './PromptViewer';
import { RESOURCE_TYPE_CONFIG } from './ResourceCard';

interface ResourceDetailModalProps {
  resource: ResourceItem | null;
  onClose: () => void;
  onOpenCreator?: (username: string) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  onOpenCreator
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(resource?.likesCount || 0);
  const [copiesCount, setCopiesCount] = useState(resource?.copiesCount || 0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!resource) return;

    setLikesCount(resource.likesCount || 0);
    setCopiesCount(resource.copiesCount || 0);

    // Track real view
    trackResourceView(resource.id);

    // Check like & bookmark state for current user
    if (user) {
      checkIsLiked(resource.id, user.uid).then(setLiked);
      checkIsBookmarked(resource.id, user.uid).then(setBookmarked);
    }

    // Load comments
    getResourceComments(resource.id).then(setComments);
  }, [resource?.id, user?.uid]);

  if (!resource) return null;

  const typeConfig = RESOURCE_TYPE_CONFIG[resource.type] || RESOURCE_TYPE_CONFIG.prompt;
  const IconComponent = typeConfig.icon;

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like this resource.');
      return;
    }
    const newLiked = await toggleLike(resource.id, user.uid, liked);
    setLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please sign in to bookmark this resource to your library.');
      return;
    }
    const newBookmarked = await toggleBookmark(resource, user.uid, bookmarked);
    setBookmarked(newBookmarked);
  };

  const handleCopyTriggered = async () => {
    await trackResourceCopy(resource.id);
    setCopiesCount(prev => prev + 1);
  };

  const handleShareLink = async () => {
    const url = `${window.location.origin}/#resource-${resource.slug || resource.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.shortDescription,
          url
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const commentData = {
        resourceId: resource.id,
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorAvatar: profile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        authorUsername: profile?.username || 'user',
        content: newComment.trim(),
        createdAt: Date.now()
      };
      const commentId = await addComment(resource.id, commentData);
      setComments(prev => [{ ...commentData, id: commentId }, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(resource.id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-900/60 p-3 sm:p-6 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
        {/* Top Header bar */}
        <div className="flex items-center justify-between border-b border-stone-200/80 px-5 py-3.5 bg-stone-50/50">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                liked
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                bookmarked
                  ? 'border-amber-200 bg-amber-50 text-amber-600'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShareLink}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Resource Title & Type Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{typeConfig.label}</span>
              </span>

              {resource.categoryName && (
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                  {resource.categoryName}
                </span>
              )}

              {resource.aiModel && (
                <span className="flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 text-xs font-mono text-stone-700">
                  <Cpu className="w-3 h-3 text-stone-500" />
                  {resource.aiModel}
                </span>
              )}

              {resource.difficulty && (
                <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-medium capitalize text-stone-600">
                  {resource.difficulty}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {resource.title}
            </h1>

            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              {resource.shortDescription}
            </p>
          </div>

          {/* Author info & metrics card */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/70 bg-stone-50/70 p-4">
            <div
              onClick={() => onOpenCreator?.(resource.authorUsername || resource.authorId)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                src={
                  resource.authorAvatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${resource.authorId}`
                }
                alt={resource.authorName}
                className="w-10 h-10 rounded-full object-cover bg-stone-200"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                    {resource.authorName}
                  </span>
                  {resource.verified && (
                    <ShieldCheck className="w-4 h-4 text-blue-500" title="Verified Creator" />
                  )}
                </div>
                <span className="text-xs text-stone-500">
                  @{resource.authorUsername || 'creator'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-stone-400" />
                <span>{resource.views || 0} views</span>
              </span>
              <span className="flex items-center gap-1">
                <Copy className="w-4 h-4 text-stone-400" />
                <span>{copiesCount} copies</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          {/* Interactive Prompt / Code Viewer */}
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
              Resource Content & Playground
            </h2>
            <PromptViewer
              content={resource.content}
              variables={resource.variables}
              onCopy={handleCopyTriggered}
              title={resource.title}
            />
          </div>

          {/* Detailed Guide & Description (if any) */}
          {resource.description && (
            <div className="rounded-xl border border-stone-200/80 bg-white p-5">
              <h2 className="text-sm font-bold text-stone-900 mb-2">Instructions & Documentation</h2>
              <div className="prose prose-stone max-w-none text-xs leading-relaxed text-stone-600 whitespace-pre-line">
                {resource.description}
              </div>
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {resource.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200 cursor-pointer"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Real-time Comments Section */}
          <div className="border-t border-stone-200 pt-6">
            <h2 className="text-sm font-bold text-stone-900 mb-4">
              Community Discussion ({comments.length})
            </h2>

            {/* Post comment input */}
            {user ? (
              <form onSubmit={handlePostComment} className="mb-6 flex gap-3">
                <img
                  src={
                    profile?.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
                  }
                  alt="Avatar"
                  className="w-8 h-8 rounded-full bg-stone-200 object-cover flex-shrink-0"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share feedback, variable suggestions, or test results..."
                    className="flex-1 rounded-lg border border-stone-200 px-3.5 py-2 text-xs text-stone-900 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="flex items-center gap-1 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-6 rounded-lg bg-stone-50 border border-stone-200/80 p-3 text-center text-xs text-stone-500">
                Sign in to join the conversation and leave a review.
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-xs text-stone-600 italic py-2">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between rounded-lg border border-stone-100 bg-stone-50/50 p-3 text-xs"
                  >
                    <div className="flex gap-2.5">
                      <img
                        src={
                          c.authorAvatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${c.authorId}`
                        }
                        alt={c.authorName}
                        className="w-7 h-7 rounded-full bg-stone-200 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{c.authorName}</span>
                          <span className="text-[10px] text-stone-600">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-stone-700 leading-relaxed">{c.content}</p>
                      </div>
                    </div>

                    {(user?.uid === c.authorId || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-stone-600 hover:text-rose-600 p-1 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
