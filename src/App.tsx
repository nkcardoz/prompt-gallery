import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { ResourceItem, CategoryItem, HomepageConfig } from './types';
import {
  getPublishedResources,
  getCategories,
  getHomepageConfig,
  getUserBookmarks,
  toggleLike,
  toggleBookmark,
  checkIsLiked,
  checkIsBookmarked
} from './lib/db';
import { seedInitialFirestoreData } from './lib/seed';

import { Sidebar } from './components/Sidebar';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { PromptViewer } from './components/PromptViewer';
import { LiveGroundedSearch } from './components/LiveGroundedSearch';
import { AIImageGenerator } from './components/AIImageGenerator';
import { CreateResourceView } from './components/CreateResourceView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { AccountSettingsView } from './components/AccountSettingsView';

import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Bot,
  Zap,
  Layers,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Compass,
  Menu,
  CheckCircle2,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function App() {
  const { user, profile, isAdmin } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'views' | 'likes'>('newest');

  // Modal States
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Data States
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User likes/bookmarks cache
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [userBookmarks, setUserBookmarks] = useState<Record<string, boolean>>({});

  // Bootstrap initial data
  const loadPlatformData = async () => {
    try {
      setLoading(true);
      const [fetchedResources, fetchedCategories, fetchedConfig] = await Promise.all([
        getPublishedResources(100),
        getCategories(),
        getHomepageConfig()
      ]);
      setResources(fetchedResources);
      setCategories(fetchedCategories);
      setHomepageConfig(fetchedConfig);
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  // When admin logs in, ensure initial categories/resources exist in Firestore
  useEffect(() => {
    if (isAdmin) {
      seedInitialFirestoreData(true).then((seeded) => {
        if (seeded) {
          loadPlatformData();
        }
      });
    }
  }, [isAdmin]);

  // Load user bookmarks when user logged in
  useEffect(() => {
    if (user) {
      getUserBookmarks(user.uid).then(bms => {
        setBookmarks(bms);
        const map: Record<string, boolean> = {};
        bms.forEach(b => {
          map[b.resourceId] = true;
        });
        setUserBookmarks(map);
      });
    } else {
      setBookmarks([]);
      setUserBookmarks({});
    }
  }, [user?.uid]);

  const handleCardLike = async (resourceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }
    const currentlyLiked = !!userLikes[resourceId];
    const newLiked = await toggleLike(resourceId, user.uid, currentlyLiked);
    setUserLikes(prev => ({ ...prev, [resourceId]: newLiked }));
    setResources(prev =>
      prev.map(r =>
        r.id === resourceId ? { ...r, likesCount: r.likesCount + (newLiked ? 1 : -1) } : r
      )
    );
  };

  const handleCardBookmark = async (resource: ResourceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }
    const currentlyBookmarked = !!userBookmarks[resource.id];
    const newBookmarked = await toggleBookmark(resource, user.uid, currentlyBookmarked);
    setUserBookmarks(prev => ({ ...prev, [resource.id]: newBookmarked }));
    setResources(prev =>
      prev.map(r =>
        r.id === resource.id
          ? { ...r, bookmarksCount: r.bookmarksCount + (newBookmarked ? 1 : -1) }
          : r
      )
    );
    // Refresh user library
    getUserBookmarks(user.uid).then(setBookmarks);
  };

  // Filter and sort items
  const filteredResources = resources.filter(res => {
    // Tab filtering
    if (currentTab === 'prompts' && res.type !== 'prompt') return false;
    if (currentTab === 'agents' && res.type !== 'agent') return false;
    if (currentTab === 'automations' && res.type !== 'automation') return false;
    if (currentTab === 'workflows' && res.type !== 'workflow') return false;
    if (currentTab === 'ai-images' && res.type !== 'image_prompt') return false;

    // Category filter
    if (selectedCategory !== 'all' && res.categoryId !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        res.title.toLowerCase().includes(q) ||
        res.shortDescription?.toLowerCase().includes(q) ||
        res.description?.toLowerCase().includes(q) ||
        res.tags?.some(t => t.toLowerCase().includes(q)) ||
        res.authorName?.toLowerCase().includes(q) ||
        res.aiModel?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Sort
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortBy === 'trending') return (b.likesCount || 0) * 2 + (b.copiesCount || 0) - ((a.likesCount || 0) * 2 + (a.copiesCount || 0));
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    if (sortBy === 'likes') return (b.likesCount || 0) - (a.likesCount || 0);
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="flex min-h-screen bg-[#faf9f6] text-stone-900 selection:bg-amber-500/20 font-sans">
      {/* Responsive Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'login') {
            setAuthModalMode('login');
            setShowAuthModal(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/80 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-stone-900">PromptFoundry</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <img
                src={
                  profile?.photoURL ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
                }
                alt="Avatar"
                onClick={() => setCurrentTab('account')}
                className="w-7 h-7 rounded-full bg-stone-200 cursor-pointer object-cover"
              />
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }}
                className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB: DISCOVER HOME */}
          {currentTab === 'home' && (
            <div className="space-y-8 pb-12">
              {/* Hero discovery search section */}
              <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50/60 p-6 sm:p-10 shadow-xs">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>The Open AI Resource Exchange</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-950 leading-tight">
                    {homepageConfig?.heroTitle || 'Discover, build and share better AI workflows.'}
                  </h1>

                  <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                    {homepageConfig?.heroSubtitle ||
                      'PromptFoundry is a curated library of production prompts, autonomous agents, automation chains, and developer templates.'}
                  </p>
                </div>

                {/* Primary Search Box */}
                <div className="mt-6 max-w-2xl">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        homepageConfig?.heroSearchPlaceholder ||
                        'Search prompts, agents, automations, templates...'
                      }
                      className="w-full rounded-2xl border border-stone-200 bg-white py-3.5 pl-11 pr-28 text-xs text-stone-900 placeholder-stone-400 shadow-xs focus:border-amber-500 focus:outline-hidden"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-20 text-xs text-stone-400 hover:text-stone-600"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentTab('grounded-search')}
                      className="absolute right-2.5 rounded-xl bg-amber-500/15 text-amber-800 px-3 py-1.5 text-xs font-semibold hover:bg-amber-500/25 transition-colors"
                      title="Run Live Search Grounded Intelligence"
                    >
                      Search AI
                    </button>
                  </div>
                </div>

                {/* Quick Category Chips */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        selectedCategory === c.id
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discovery Section Controls: Tabs & Sort */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
                <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
                  {(['newest', 'trending', 'views', 'likes'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`rounded-lg px-3 py-1.5 capitalize transition-all ${
                        sortBy === s
                          ? 'bg-amber-500/15 text-amber-800 font-semibold'
                          : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      {s === 'newest' && 'Latest Added'}
                      {s === 'trending' && 'Trending Now'}
                      {s === 'views' && 'Most Viewed'}
                      {s === 'likes' && 'Top Voted'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span>Showing {sortedResources.length} resources</span>
                </div>
              </div>

              {/* Resource Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-64 rounded-xl border border-stone-200 bg-white p-4 animate-pulse"
                    />
                  ))}
                </div>
              ) : sortedResources.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center max-w-md mx-auto">
                  <Compass className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-stone-800">No resources found</h3>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Try adjusting your filters or search keywords, or publish the first resource in
                    this category!
                  </p>
                  <button
                    onClick={() => setCurrentTab('create')}
                    className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Publish Resource
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedResources.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onOpen={(r) => setActiveResource(r)}
                      onLike={handleCardLike}
                      onBookmark={handleCardBookmark}
                      isLiked={!!userLikes[res.id]}
                      isBookmarked={!!userBookmarks[res.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROMPTS / AGENTS / AUTOMATIONS / WORKFLOWS / AI IMAGES (Dedicated Filter Views) */}
          {['prompts', 'agents', 'automations', 'workflows', 'ai-images'].includes(currentTab) && (
            <div className="space-y-6 pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 capitalize">
                    {currentTab.replace('-', ' ')}
                  </h1>
                  <p className="text-xs text-stone-500">
                    Explore high-grade, battle-tested items for your AI tech stack.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('create')}
                  className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish New</span>
                </button>
              </div>

              {sortedResources.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-stone-800">No items found in this section</h3>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Be the pioneer who adds the first item!
                  </p>
                  <button
                    onClick={() => setCurrentTab('create')}
                    className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Publish to Foundry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedResources.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onOpen={(r) => setActiveResource(r)}
                      onLike={handleCardLike}
                      onBookmark={handleCardBookmark}
                      isLiked={!!userLikes[res.id]}
                      isBookmarked={!!userBookmarks[res.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: LIVE GROUNDED AI SEARCH */}
          {currentTab === 'grounded-search' && (
            <div className="space-y-6 pb-12 max-w-4xl mx-auto">
              <LiveGroundedSearch />
            </div>
          )}

          {/* TAB: COLLECTIONS & AI IMAGES GENERATOR */}
          {currentTab === 'collections' && (
            <div className="space-y-6 pb-12 max-w-4xl mx-auto">
              <AIImageGenerator />
            </div>
          )}

          {/* TAB: USER SAVED LIBRARY */}
          {currentTab === 'library' && (
            <div className="space-y-6 pb-12">
              <div>
                <h1 className="text-xl font-bold text-stone-900">Your Saved Library</h1>
                <p className="text-xs text-stone-500">
                  Quick access to all bookmarked prompts, workflows, and agents.
                </p>
              </div>

              {!user ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center max-w-md mx-auto">
                  <Bookmark className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-stone-800">Sign in to view bookmarks</h3>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Keep track of your favorite AI tools and recipes across all your devices.
                  </p>
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setShowAuthModal(true);
                    }}
                    className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white"
                  >
                    Sign In
                  </button>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center max-w-md mx-auto">
                  <Bookmark className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-stone-800">No bookmarked resources yet</h3>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Click the bookmark icon on any card in the explorer to save it here.
                  </p>
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Browse Directory
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {resources
                    .filter((r) => userBookmarks[r.id])
                    .map((res) => (
                      <ResourceCard
                        key={res.id}
                        resource={res}
                        onOpen={(r) => setActiveResource(r)}
                        onLike={handleCardLike}
                        onBookmark={handleCardBookmark}
                        isLiked={!!userLikes[res.id]}
                        isBookmarked={true}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PUBLISH / CREATE RESOURCE */}
          {currentTab === 'create' && (
            <CreateResourceView
              categories={categories}
              onSuccess={(id) => {
                loadPlatformData();
                setCurrentTab('home');
              }}
              onCancel={() => setCurrentTab('home')}
            />
          )}

          {/* TAB: CREATOR DASHBOARD STUDIO */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-stone-900">Creator Studio</h1>
                  <p className="text-xs text-stone-500">
                    Track performance, views, copies, and manage your published resources.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('create')}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Create New
                </button>
              </div>

              {!user ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-stone-800">Please Sign In</h3>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Sign in to manage your published content and view creator analytics.
                  </p>
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setShowAuthModal(true);
                    }}
                    className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Creator Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(() => {
                      const myResources = resources.filter((r) => r.authorId === user.uid);
                      const totalViews = myResources.reduce((a, b) => a + (b.views || 0), 0);
                      const totalLikes = myResources.reduce((a, b) => a + (b.likesCount || 0), 0);
                      const totalCopies = myResources.reduce((a, b) => a + (b.copiesCount || 0), 0);
                      return (
                        <>
                          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
                            <span className="text-xs font-medium text-stone-500">My Resources</span>
                            <p className="text-2xl font-bold text-stone-900 mt-1">
                              {myResources.length}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
                            <span className="text-xs font-medium text-stone-500">Total Views</span>
                            <p className="text-2xl font-bold text-stone-900 mt-1">{totalViews}</p>
                          </div>
                          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
                            <span className="text-xs font-medium text-stone-500">Upvotes</span>
                            <p className="text-2xl font-bold text-stone-900 mt-1">{totalLikes}</p>
                          </div>
                          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
                            <span className="text-xs font-medium text-stone-500">Copies / Runs</span>
                            <p className="text-2xl font-bold text-stone-900 mt-1">{totalCopies}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* My Resources List */}
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
                    <h3 className="text-sm font-bold text-stone-900 mb-4">My Published Items</h3>
                    {resources.filter((r) => r.authorId === user.uid).length === 0 ? (
                      <p className="text-xs text-stone-400 italic">
                        You have not published any resources yet. Click "Create New" to get started!
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources
                          .filter((r) => r.authorId === user.uid)
                          .map((r) => (
                            <ResourceCard
                              key={r.id}
                              resource={r}
                              onOpen={(res) => setActiveResource(res)}
                              onLike={handleCardLike}
                              onBookmark={handleCardBookmark}
                              isLiked={!!userLikes[r.id]}
                              isBookmarked={!!userBookmarks[r.id]}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ADMIN CMS */}
          {currentTab === 'admin' && (
            <AdminDashboard
              resources={resources}
              categories={categories}
              onRefreshData={loadPlatformData}
              onEditResource={(res) => setActiveResource(res)}
            />
          )}

          {/* TAB: ACCOUNT & SETTINGS */}
          {currentTab === 'account' && <AccountSettingsView />}
        </main>
      </div>

      {/* Resource Detail Modal */}
      {activeResource && (
        <ResourceDetailModal
          resource={activeResource}
          onClose={() => setActiveResource(null)}
          onOpenCreator={(u) => {
            setSearchQuery(u);
            setCurrentTab('home');
            setActiveResource(null);
          }}
        />
      )}

      {/* Auth Modal (Login / Signup) */}
      {showAuthModal && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            loadPlatformData();
          }}
        />
      )}
    </div>
  );
}
