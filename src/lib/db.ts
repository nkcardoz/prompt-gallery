import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ResourceItem, CategoryItem, TagItem, CommentItem, HomepageConfig } from '../types';
import { INITIAL_CATEGORIES, INITIAL_RESOURCES } from './seed';

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroTitle: 'Discover, build and share better AI workflows.',
  heroSubtitle: 'PromptFoundry is the open resource directory for production-ready AI prompts, autonomous agents, automation chains, and developer templates.',
  heroSearchPlaceholder: 'Search prompts, agents, automations, templates...',
  featuredResourceIds: [],
  trendingResourceIds: [],
  sectionsOrder: ['hero', 'categories', 'featured', 'trending', 'agents', 'automations', 'creators', 'latest'],
  visibleSections: {
    hero: true,
    categories: true,
    featured: true,
    trending: true,
    agents: true,
    automations: true,
    creators: true,
    latest: true
  },
  sectionTitles: {
    featured: 'Featured Resources',
    trending: 'Trending Workflows',
    agents: 'Autonomous AI Agents',
    automations: 'Automations & Integration Scripts',
    creators: 'Featured Creators & Engineers',
    latest: 'Latest Resources'
  },
  ctaText: 'Publish Your Prompt',
  ctaLink: '/create'
};

// --- RESOURCES API ---
export async function getPublishedResources(max = 50): Promise<ResourceItem[]> {
  try {
    const q = query(
      collection(db, 'resources'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return INITIAL_RESOURCES.map(r => ({ ...r, id: r.slug } as ResourceItem));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ResourceItem));
  } catch (err) {
    console.warn('Using initial resources fallback:', err);
    return INITIAL_RESOURCES.map(r => ({ ...r, id: r.slug } as ResourceItem));
  }
}

export async function getResourceBySlug(slug: string): Promise<ResourceItem | null> {
  try {
    const q = query(collection(db, 'resources'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      // Try direct ID match if slug is ID
      const direct = await getDoc(doc(db, 'resources', slug));
      if (direct.exists()) {
        return { id: direct.id, ...direct.data() } as ResourceItem;
      }
      const fallback = INITIAL_RESOURCES.find(r => r.slug === slug);
      return fallback ? ({ ...fallback, id: fallback.slug } as ResourceItem) : null;
    }
    const docData = snap.docs[0];
    return { id: docData.id, ...docData.data() } as ResourceItem;
  } catch (err) {
    console.warn('Error fetching resource by slug, trying fallback:', err);
    const fallback = INITIAL_RESOURCES.find(r => r.slug === slug);
    return fallback ? ({ ...fallback, id: fallback.slug } as ResourceItem) : null;
  }
}

export async function createResource(resource: Omit<ResourceItem, 'id'>, customId?: string): Promise<string> {
  const resourceRef = customId ? doc(db, 'resources', customId) : doc(collection(db, 'resources'));
  const id = resourceRef.id;
  const data: ResourceItem = {
    ...resource,
    id,
    views: resource.views || 0,
    likesCount: resource.likesCount || 0,
    copiesCount: resource.copiesCount || 0,
    bookmarksCount: resource.bookmarksCount || 0,
    commentsCount: resource.commentsCount || 0,
    createdAt: resource.createdAt || Date.now(),
    updatedAt: Date.now()
  };
  await setDoc(resourceRef, data);
  return id;
}

export async function updateResource(id: string, updates: Partial<ResourceItem>): Promise<void> {
  const resourceRef = doc(db, 'resources', id);
  await updateDoc(resourceRef, { ...updates, updatedAt: Date.now() });
}

export async function deleteResource(id: string): Promise<void> {
  await deleteDoc(doc(db, 'resources', id));
}

// --- VIEWS, COPIES, LIKES, BOOKMARKS ---
export async function trackResourceView(resourceId: string): Promise<void> {
  try {
    const viewKey = `pf_view_${resourceId}`;
    const lastViewed = sessionStorage.getItem(viewKey);
    const now = Date.now();
    if (lastViewed && now - parseInt(lastViewed, 10) < 30000) {
      return; // anti-spam view cooldown 30s
    }
    sessionStorage.setItem(viewKey, now.toString());
    const resourceRef = doc(db, 'resources', resourceId);
    await updateDoc(resourceRef, { views: increment(1) });
  } catch (err) {
    console.error('Error updating view count:', err);
  }
}

export async function trackResourceCopy(resourceId: string): Promise<void> {
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    await updateDoc(resourceRef, { copiesCount: increment(1) });
  } catch (err) {
    console.error('Error incrementing copy count:', err);
  }
}

export async function toggleLike(resourceId: string, userId: string, currentLiked: boolean): Promise<boolean> {
  const likeDocRef = doc(db, 'resources', resourceId, 'likes', userId);
  const resourceRef = doc(db, 'resources', resourceId);

  if (currentLiked) {
    await deleteDoc(likeDocRef);
    await updateDoc(resourceRef, { likesCount: increment(-1) });
    return false;
  } else {
    await setDoc(likeDocRef, { userId, createdAt: Date.now() });
    await updateDoc(resourceRef, { likesCount: increment(1) });
    return true;
  }
}

export async function checkIsLiked(resourceId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  const likeDocRef = doc(db, 'resources', resourceId, 'likes', userId);
  const snap = await getDoc(likeDocRef);
  return snap.exists();
}

export async function toggleBookmark(resource: ResourceItem, userId: string, currentBookmarked: boolean): Promise<boolean> {
  const bookmarkRef = doc(db, 'user_bookmarks', `${userId}_${resource.id}`);
  const resourceSubRef = doc(db, 'resources', resource.id, 'bookmarks', userId);
  const resourceRef = doc(db, 'resources', resource.id);

  if (currentBookmarked) {
    await deleteDoc(bookmarkRef);
    await deleteDoc(resourceSubRef);
    await updateDoc(resourceRef, { bookmarksCount: increment(-1) });
    return false;
  } else {
    const bData = {
      userId,
      resourceId: resource.id,
      title: resource.title,
      type: resource.type,
      shortDescription: resource.shortDescription,
      thumbnail: resource.thumbnail || '',
      categoryName: resource.categoryName || '',
      slug: resource.slug,
      createdAt: Date.now()
    };
    await setDoc(bookmarkRef, bData);
    await setDoc(resourceSubRef, { userId, createdAt: Date.now() });
    await updateDoc(resourceRef, { bookmarksCount: increment(1) });
    return true;
  }
}

export async function checkIsBookmarked(resourceId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  const bookmarkRef = doc(db, 'user_bookmarks', `${userId}_${resourceId}`);
  const snap = await getDoc(bookmarkRef);
  return snap.exists();
}

export async function getUserBookmarks(userId: string): Promise<any[]> {
  const q = query(collection(db, 'user_bookmarks'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --- COMMENTS ---
export async function getResourceComments(resourceId: string): Promise<CommentItem[]> {
  try {
    const q = query(
      collection(db, 'resources', resourceId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentItem));
  } catch (err) {
    console.error('Error fetching comments:', err);
    return [];
  }
}

export async function addComment(resourceId: string, comment: Omit<CommentItem, 'id'>): Promise<string> {
  const cRef = doc(collection(db, 'resources', resourceId, 'comments'));
  const data = { ...comment, id: cRef.id, createdAt: Date.now() };
  await setDoc(cRef, data);
  await updateDoc(doc(db, 'resources', resourceId), { commentsCount: increment(1) });
  return cRef.id;
}

export async function deleteComment(resourceId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(db, 'resources', resourceId, 'comments', commentId));
  await updateDoc(doc(db, 'resources', resourceId), { commentsCount: increment(-1) });
}

// --- CATEGORIES ---
export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) {
      return INITIAL_CATEGORIES;
    }
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CategoryItem));
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.warn('Using initial categories fallback:', err);
    return INITIAL_CATEGORIES;
  }
}

export async function saveCategory(cat: Partial<CategoryItem> & { name: string; slug: string }): Promise<void> {
  const id = cat.id || cat.slug;
  const ref = doc(db, 'categories', id);
  const snap = await getDoc(ref);
  const data = {
    ...cat,
    id,
    order: cat.order ?? 0,
    active: cat.active ?? true,
    createdAt: snap.exists() ? (snap.data().createdAt || Date.now()) : Date.now()
  };
  await setDoc(ref, data, { merge: true });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

// --- HOMEPAGE CONFIG ---
export async function getHomepageConfig(): Promise<HomepageConfig> {
  try {
    const ref = doc(db, 'homepageConfig', 'main');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_HOMEPAGE_CONFIG, ...snap.data() } as HomepageConfig;
    }
    return DEFAULT_HOMEPAGE_CONFIG;
  } catch (err) {
    console.warn('Could not read homepageConfig from Firestore, falling back to default:', err);
    return DEFAULT_HOMEPAGE_CONFIG;
  }
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<void> {
  const ref = doc(db, 'homepageConfig', 'main');
  await setDoc(ref, config, { merge: true });
}
