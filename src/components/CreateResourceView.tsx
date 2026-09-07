import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createResource } from '../lib/db';
import { ResourceType, ResourceItem, CategoryItem, PromptVariable } from '../types';
import { Plus, Trash2, CheckCircle2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { RESOURCE_TYPE_CONFIG } from './ResourceCard';

interface CreateResourceViewProps {
  categories: CategoryItem[];
  onSuccess: (newResourceId: string) => void;
  onCancel: () => void;
}

export const CreateResourceView: React.FC<CreateResourceViewProps> = ({
  categories,
  onSuccess,
  onCancel
}) => {
  const { user, profile } = useAuth();

  const [type, setType] = useState<ResourceType>('prompt');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'ai-agents');
  const [aiModel, setAiModel] = useState('Claude 3.7 / Gemini 3 Pro');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [tagsInput, setTagsInput] = useState('agent, prompt, workflow');
  const [thumbnail, setThumbnail] = useState('');
  const [variables, setVariables] = useState<PromptVariable[]>([
    { name: 'topic', label: 'Primary Topic', defaultValue: 'Distributed Architecture' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-stone-900 mb-1">Sign In to Publish</h2>
        <p className="text-xs text-stone-500 mb-6">
          You must be logged in to create and share AI prompts, workflows, and agents.
        </p>
        <button
          onClick={onCancel}
          className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
        >
          Return to Explorer
        </button>
      </div>
    );
  }

  const handleAddVariable = () => {
    setVariables(prev => [...prev, { name: '', label: '', defaultValue: '' }]);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariableChange = (index: number, field: keyof PromptVariable, val: string) => {
    setVariables(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (status: 'published' | 'draft') => {
    if (!title.trim() || !content.trim()) {
      setError('Please provide a title and resource content.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedCat = categories.find(c => c.id === categoryId);
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

      const tags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      const cleanVariables = variables.filter(v => v.name.trim().length > 0);

      const resourceData: Omit<ResourceItem, 'id'> = {
        type,
        title: title.trim(),
        slug,
        shortDescription: shortDescription.trim() || title.trim(),
        description: description.trim(),
        content: content.trim(),
        thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split('@')[0] || 'Creator',
        authorUsername: profile?.username || 'user',
        authorAvatar: profile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        categoryId,
        categoryName: selectedCat?.name || 'General',
        tags,
        status,
        visibility: 'public',
        featured: false,
        verified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        publishedAt: status === 'published' ? Date.now() : undefined,
        views: 0,
        likesCount: 0,
        copiesCount: 0,
        bookmarksCount: 0,
        commentsCount: 0,
        aiModel,
        difficulty,
        variables: cleanVariables
      };

      const newId = await createResource(resourceData);
      onSuccess(newId);
    } catch (err: any) {
      console.error('Error creating resource:', err);
      setError(err?.message || 'Failed to save resource in Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Publish New AI Resource</h1>
          <p className="text-xs text-stone-500">
            Share production-grade prompts, agents, automations, or templates with the community.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-medium text-stone-500 hover:text-stone-800"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-6">
        {/* Resource Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">Resource Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(Object.keys(RESOURCE_TYPE_CONFIG) as ResourceType[]).map((t) => {
              const cfg = RESOURCE_TYPE_CONFIG[t];
              const Icon = cfg.icon;
              const isSelected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 text-amber-900 font-semibold shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span className="truncate">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title & Short Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Senior Systems Architect Prompt with Verification Loop"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Short Description (Card Teaser)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One concise sentence explaining what this workflow does."
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category, Model, Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Target AI Model / Tool
            </label>
            <input
              type="text"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder="e.g. Claude 3.7 / Gemini 3 Pro"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Content (Prompt / Agent System Prompt / Script) */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Resource Content (Prompt / Workflow Blueprint) <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-stone-600 mb-2">
            Use <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-700 font-mono">{'{{variable_name}}'}</code> for interactive user variables.
          </p>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your system prompt, automation script, or workflow specifications here..."
            className="w-full rounded-xl border border-stone-200 font-mono text-xs px-3.5 py-3 text-stone-900 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        {/* Interactive Variables Manager */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-stone-700">Dynamic Prompt Variables</span>
              <p className="text-[11px] text-stone-600">
                Allow users to customize prompt parameters dynamically before copying.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariable}
              className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variable</span>
            </button>
          </div>

          <div className="space-y-2">
            {variables.map((v, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="variable_name"
                  value={v.name}
                  onChange={(e) => handleVariableChange(idx, 'name', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-200 px-2.5 py-1.5 font-mono text-xs text-stone-900"
                />
                <input
                  type="text"
                  placeholder="Human Label"
                  value={v.label || ''}
                  onChange={(e) => handleVariableChange(idx, 'label', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs text-stone-900"
                />
                <input
                  type="text"
                  placeholder="Default Value"
                  value={v.defaultValue || ''}
                  onChange={(e) => handleVariableChange(idx, 'defaultValue', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVariable(idx)}
                  className="p-1 text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Instructions & Documentation */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Usage Guide & Detailed Instructions
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain how to deploy, recommended temperatures, prerequisites, or required API keys."
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        {/* Tags & Thumbnail URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="agents, automation, python, rag"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Cover Image URL (Unsplash or direct image)
            </label>
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('draft')}
            className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('published')}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-semibold text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition-all shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing to Firestore...' : 'Publish to Foundry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
