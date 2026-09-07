import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ResourceItem,
  CategoryItem,
  HomepageConfig
} from '../types';
import {
  getHomepageConfig,
  saveHomepageConfig,
  updateResource,
  deleteResource,
  saveCategory,
  deleteCategory
} from '../lib/db';
import { seedInitialFirestoreData } from '../lib/seed';
import {
  Shield,
  Layers,
  Users,
  Settings,
  Star,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  FolderPlus,
  Search,
  Database
} from 'lucide-react';
import { RESOURCE_TYPE_CONFIG } from './ResourceCard';

interface AdminDashboardProps {
  resources: ResourceItem[];
  categories: CategoryItem[];
  onRefreshData: () => Promise<void>;
  onEditResource: (resource: ResourceItem) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  resources,
  categories,
  onRefreshData,
  onEditResource
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'resources' | 'homepage' | 'categories' | 'analytics'>('resources');

  // Resource filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Homepage CMS state
  const [hpConfig, setHpConfig] = useState<HomepageConfig | null>(null);
  const [savingHp, setSavingHp] = useState(false);
  const [hpSuccess, setHpSuccess] = useState(false);

  // Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Seeding state
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const success = await seedInitialFirestoreData(true);
      if (success) {
        setSeedMessage('Initial catalog and categories successfully verified/seeded in Firestore!');
        await onRefreshData();
      } else {
        setSeedMessage('Catalog was already seeded or database returned no changes.');
      }
    } catch (e: any) {
      setSeedMessage('Seeding status: ' + (e?.message || 'Database synchronized'));
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedMessage(null), 5000);
    }
  };

  useEffect(() => {
    getHomepageConfig().then(setHpConfig);
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold">Admin Privileges Required</h2>
        <p className="mt-1 text-xs text-rose-600">
          Only authorized administrators can access the PromptFoundry CMS Studio.
        </p>
      </div>
    );
  }

  const handleToggleFeatured = async (res: ResourceItem) => {
    try {
      await updateResource(res.id, { featured: !res.featured });
      await onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleVerified = async (res: ResourceItem) => {
    try {
      await updateResource(res.id, { verified: !res.verified });
      await onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeStatus = async (res: ResourceItem, status: any) => {
    try {
      await updateResource(res.id, { status });
      await onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteResource = async (resId: string) => {
    if (!confirm('Are you sure you want to permanently delete this resource from Firestore?')) return;
    try {
      await deleteResource(resId);
      await onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveHomepageCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hpConfig) return;
    setSavingHp(true);
    setHpSuccess(false);
    try {
      await saveHomepageConfig(hpConfig);
      setHpSuccess(true);
      setTimeout(() => setHpSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingHp(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await saveCategory({
        name: newCatName.trim(),
        slug,
        description: newCatDesc.trim(),
        order: categories.length + 1,
        active: true
      });
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
      await onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCat = async (catId: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(catId);
      await onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered resources
  const filteredResources = resources.filter(r => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-stone-900">Foundry CMS & Admin Studio</h1>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Real-time management for resources, homepage content curation, categories, and analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 shadow-2xs transition-colors disabled:opacity-50"
            title="Seed curated catalog into Firestore if collections are empty"
          >
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>{isSeeding ? 'Syncing...' : 'Sync Catalog to Firestore'}</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex items-center rounded-xl border border-stone-200 bg-stone-100/70 p-1 text-xs">
            <button
              onClick={() => setActiveTab('resources')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeTab === 'resources' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('homepage')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeTab === 'homepage' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Homepage CMS
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeTab === 'categories' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeTab === 'analytics' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              System Analytics
            </button>
          </div>
        </div>
      </div>

      {seedMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-center justify-between">
          <span>{seedMessage}</span>
          <button onClick={() => setSeedMessage(null)} className="text-amber-700 hover:text-amber-900 font-bold ml-3">✕</button>
        </div>
      )}

      {/* TAB 1: RESOURCES MANAGEMENT TABLE */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter resources by title, creator, or tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="all">All Types</option>
                {Object.keys(RESOURCE_TYPE_CONFIG).map((t) => (
                  <option key={t} value={t}>
                    {RESOURCE_TYPE_CONFIG[t as keyof typeof RESOURCE_TYPE_CONFIG].label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onRefreshData()}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Curation</th>
                  <th className="py-3 px-4">Metrics</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No matching resources found.
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-stone-900 truncate">{res.title}</div>
                        <div className="text-[11px] text-stone-500 truncate">{res.slug}</div>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span className="rounded bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
                          {res.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-800">{res.authorName}</div>
                        <div className="text-[10px] text-stone-400">@{res.authorUsername || 'user'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={res.status}
                          onChange={(e) => handleChangeStatus(res, e.target.value)}
                          className={`rounded px-2 py-1 text-[11px] font-semibold border-0 ${
                            res.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleFeatured(res)}
                            title={res.featured ? 'Remove from Featured' : 'Mark as Featured'}
                            className={`p-1 rounded ${
                              res.featured ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-stone-600'
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                          <button
                            onClick={() => handleToggleVerified(res)}
                            title={res.verified ? 'Remove Verified' : 'Mark as Verified'}
                            className={`p-1 rounded ${
                              res.verified ? 'text-blue-500 bg-blue-50' : 'text-stone-300 hover:text-stone-600'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-stone-500">
                        <div>{res.views || 0} views • {res.likesCount || 0} likes</div>
                        <div>{res.copiesCount || 0} copies • {res.bookmarksCount || 0} saves</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditResource(res)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 rounded hover:bg-stone-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HOMEPAGE CONFIG CMS */}
      {activeTab === 'homepage' && hpConfig && (
        <form onSubmit={handleSaveHomepageCMS} className="max-w-3xl space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900">Homepage Hero & Search Config</h2>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={hpConfig.heroTitle}
                onChange={(e) => setHpConfig({ ...hpConfig, heroTitle: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Hero Subtitle</label>
              <textarea
                rows={3}
                value={hpConfig.heroSubtitle}
                onChange={(e) => setHpConfig({ ...hpConfig, heroSubtitle: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Search Bar Placeholder
              </label>
              <input
                type="text"
                value={hpConfig.heroSearchPlaceholder}
                onChange={(e) => setHpConfig({ ...hpConfig, heroSearchPlaceholder: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900">Section Visibility & Titles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(hpConfig.visibleSections).map(([key, visible]) => (
                <label
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-stone-200 p-3 hover:bg-stone-50 cursor-pointer"
                >
                  <span className="text-xs font-medium text-stone-800 capitalize">
                    Section: {key}
                  </span>
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) =>
                      setHpConfig({
                        ...hpConfig,
                        visibleSections: { ...hpConfig.visibleSections, [key]: e.target.checked }
                      })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {hpSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
              Homepage configuration saved to Firestore successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={savingHp}
            className="flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {savingHp ? 'Writing to Firestore...' : 'Publish Homepage CMS Changes'}
          </button>
        </form>
      )}

      {/* TAB 3: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateCategory} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-amber-500" />
              <span>Create New Category</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Category Name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
              />
              <input
                type="text"
                placeholder="slug (e.g. ai-governance)"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
              />
              <input
                type="text"
                placeholder="Short Description"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
              />
            </div>
            <button
              type="submit"
              disabled={savingCat || !newCatName.trim()}
              className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
            >
              Add Category
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs"
              >
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{c.name}</h4>
                  <p className="text-[11px] text-stone-500 truncate max-w-[200px]">{c.description}</p>
                  <span className="text-[10px] font-mono text-stone-400">/{c.slug}</span>
                </div>
                <button
                  onClick={() => handleDeleteCat(c.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-stone-500">Total Resources</span>
              <p className="text-2xl font-bold text-stone-900 mt-1">{resources.length}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-stone-500">Total Views</span>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {resources.reduce((acc, r) => acc + (r.views || 0), 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-stone-500">Total Likes</span>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {resources.reduce((acc, r) => acc + (r.likesCount || 0), 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-stone-500">Total Prompt Copies</span>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {resources.reduce((acc, r) => acc + (r.copiesCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
