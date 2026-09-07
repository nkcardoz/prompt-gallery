import { ResourceItem, CategoryItem } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'ai-agents', name: 'AI Agents', slug: 'ai-agents', description: 'Autonomous agent architectures, tool-calling systems, and goal planners.', order: 1, active: true, createdAt: Date.now() },
  { id: 'automations', name: 'Automations', slug: 'automations', description: 'Make, Zapier, n8n, and custom API automated pipelines.', order: 2, active: true, createdAt: Date.now() },
  { id: 'coding-dev', name: 'Coding & Dev', slug: 'coding-dev', description: 'Software architecture, refactoring, code generation, and test suite prompts.', order: 3, active: true, createdAt: Date.now() },
  { id: 'marketing-sales', name: 'Marketing & Sales', slug: 'marketing-sales', description: 'High-converting copy, funnel strategies, and outreach sequences.', order: 4, active: true, createdAt: Date.now() },
  { id: 'image-generation', name: 'Image Generation', slug: 'image-generation', description: 'Midjourney, Gemini Image, Stable Diffusion photographic & artistic styles.', order: 5, active: true, createdAt: Date.now() },
  { id: 'writing-content', name: 'Writing & Editorial', slug: 'writing-content', description: 'Long-form editorial essays, ghostwriting tones, and content frameworks.', order: 6, active: true, createdAt: Date.now() },
  { id: 'productivity-systems', name: 'Productivity Systems', slug: 'productivity-systems', description: 'Second brains, executive summarizers, and decision trees.', order: 7, active: true, createdAt: Date.now() },
  { id: 'research-analysis', name: 'Research & Analysis', slug: 'research-analysis', description: 'Literature reviews, synthesis matrices, and competitive audits.', order: 8, active: true, createdAt: Date.now() }
];

export const INITIAL_RESOURCES: Omit<ResourceItem, 'id'>[] = [
  {
    type: 'agent',
    title: 'Autonomous Full-Stack Architect Agent',
    slug: 'autonomous-full-stack-architect-agent',
    shortDescription: 'Multi-step autonomous agent prompt that plans, executes, and audits production codebases.',
    description: `A battle-tested system prompt for autonomous coding agents. It enforces structural separation, typed contracts, defensive error handling, and test-first verification before declaring tasks complete.

Designed for modern models like Claude 3.7 Sonnet, Gemini 2.5/3 Pro, and GPT-4.1. Includes built-in token budgeting and regression checking loops.`,
    content: `You are an Autonomous Principal Software Architect. Your mission is to execute user requests with zero regressions and production-level craftsmanship.

### Operational Principles:
1. NEVER assume directory structures or API contracts without inspecting the codebase first.
2. Step 1: System Analysis & Dependency Mapping. Formulate a 3-step action plan before any edits.
3. Step 2: Surgical Modification. Make minimal, clean, non-breaking edits with strict TypeScript compliance.
4. Step 3: Automated Verification. Run linters, test harnesses, and type checks.
5. Provide a crisp, human-readable changelog upon completion.

Inputs required:
- Target Stack: {{target_stack}}
- Problem Scope: {{problem_scope}}
- Architecture Constraints: {{architecture_constraints}}`,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    authorId: 'admin_seed',
    authorName: 'Foundry Core Engineering',
    authorUsername: 'promptfoundry',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=foundry-core',
    categoryId: 'ai-agents',
    categoryName: 'AI Agents',
    tags: ['agents', 'typescript', 'architecture', 'coding'],
    status: 'published',
    visibility: 'public',
    featured: true,
    verified: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    publishedAt: Date.now() - 86400000 * 4,
    views: 1420,
    likesCount: 88,
    copiesCount: 235,
    bookmarksCount: 64,
    commentsCount: 3,
    aiModel: 'Gemini 3 Pro / Claude 3.7',
    difficulty: 'advanced',
    variables: [
      { name: 'target_stack', label: 'Target Tech Stack', defaultValue: 'React 19 + Node.js + PostgreSQL', description: 'Primary frameworks and runtime' },
      { name: 'problem_scope', label: 'Problem Scope', defaultValue: 'Implement atomic state syncing with optimistic rollbacks', description: 'What feature or bug to tackle' },
      { name: 'architecture_constraints', label: 'Constraints', defaultValue: 'Zero external state management libraries, <15kb bundle impact', description: 'Performance or architectural limits' }
    ]
  },
  {
    type: 'prompt',
    title: 'Executive Strategic Decision Memorandum',
    slug: 'executive-strategic-decision-memorandum',
    shortDescription: 'Transforms messy brainstorms into structured, c-suite investment theses and risk matrices.',
    description: `Takes raw notes, metrics, and meeting logs and condenses them into a crisp 1-page executive memo following the Amazon Six-Pager and McKinsey structured problem-solving method.`,
    content: `Act as a senior Chief of Staff and Strategy Partner. Synthesize the provided raw background into an Executive Decision Memorandum formatted as follows:

# Executive Memorandum: {{proposal_title}}
**To:** {{target_decision_makers}}
**From:** Strategy & Operations
**Date:** Current

## 1. Executive Summary & Core Recommendation
(2 paragraphs maximum. Clear "Ask" and measurable financial/strategic ROI).

## 2. Problem Statement & Root Cause
- What changed in the market or operational environment?
- Why is inaction more costly than the proposed investment?

## 3. Options Evaluated
| Option | Estimated Capex | Time to Value | Primary Risk |
|---|---|---|---|
| Option A: {{option_a_name}} | $ | weeks | |
| Option B: {{option_b_name}} | $ | weeks | |

## 4. Proposed Execution Roadmap & Milestones
- Phase 1 (Days 1-30): Validation & Core Setup
- Phase 2 (Days 31-90): Rollout & Team Enablement

## 5. Pre-Mortem & Mitigation Plan
(Highlight top 3 failure modes and defensive guardrails).`,
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    authorId: 'admin_seed',
    authorName: 'Alex Rivera',
    authorUsername: 'arivera',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    categoryId: 'writing-content',
    categoryName: 'Writing & Editorial',
    tags: ['strategy', 'executive', 'memo', 'leadership'],
    status: 'published',
    visibility: 'public',
    featured: true,
    verified: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    publishedAt: Date.now() - 86400000 * 3,
    views: 980,
    likesCount: 62,
    copiesCount: 180,
    bookmarksCount: 45,
    commentsCount: 1,
    aiModel: 'Any LLM (Gemini / GPT / Claude)',
    difficulty: 'intermediate',
    variables: [
      { name: 'proposal_title', label: 'Proposal Title', defaultValue: 'Enterprise Migration to Cloud Native Event-Driven Ingestion', description: 'Headline of the strategic proposal' },
      { name: 'target_decision_makers', label: 'Decision Makers', defaultValue: 'Chief Technology Officer & VP Engineering', description: 'Stakeholders reading the memo' },
      { name: 'option_a_name', label: 'Option A', defaultValue: 'Build In-House Kafka Cluster', description: 'First evaluated alternative' },
      { name: 'option_b_name', label: 'Option B', defaultValue: 'Managed Google Cloud Pub/Sub Pipeline', description: 'Second evaluated alternative' }
    ]
  },
  {
    type: 'automation',
    title: 'Lead Enrichment & Slack Triage Webhook Pipeline',
    slug: 'lead-enrichment-slack-triage-pipeline',
    shortDescription: 'n8n / webhook blueprint that checks incoming signups, extracts firmographics, and pings sales.',
    description: `An end-to-end automation workflow configuration. When a new contact form submits, this workflow verifies business domains, pulls Crunchbase & LinkedIn data via APIs, scores ICP match, and routes high-intent alerts directly to your VIP Slack channel.`,
    content: `{
  "name": "Automated Lead Enrichment & VIP Slack Dispatch",
  "nodes": [
    {
      "parameters": { "httpMethod": "POST", "path": "webhook-lead" },
      "name": "Webhook Ingestion",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "url": "https://api.hunter.io/v2/email-verifier",
        "options": { "queryParameters": { "email": "={{ $json.body.email }}" } }
      },
      "name": "Verify Corporate Domain",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "parameters": {
        "channel": "{{slack_channel_id}}",
        "text": "🔥 *Hot ICP Lead Inbound*: {{ $json.body.company_name }} ($json.body.arr_tier)",
        "attachments": []
      },
      "name": "Slack High Priority Notification",
      "type": "n8n-nodes-base.slack"
    }
  ]
}`,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    authorId: 'admin_seed',
    authorName: 'Sarah Chen',
    authorUsername: 'schen_ops',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    categoryId: 'automations',
    categoryName: 'Automations',
    tags: ['n8n', 'slack', 'leadgen', 'webhooks'],
    status: 'published',
    visibility: 'public',
    featured: true,
    verified: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    publishedAt: Date.now() - 86400000 * 2,
    views: 840,
    likesCount: 51,
    copiesCount: 142,
    bookmarksCount: 39,
    commentsCount: 2,
    aiModel: 'Automation Script / n8n',
    difficulty: 'intermediate',
    variables: [
      { name: 'slack_channel_id', label: 'Slack Alert Channel', defaultValue: '#vip-leads-alerts', description: 'Destination channel for priority pings' }
    ]
  },
  {
    type: 'image_prompt',
    title: 'Ultra-Minimalist Product Editorial Photography',
    slug: 'ultra-minimalist-product-editorial-photography',
    shortDescription: 'Studio lighting, tactile ceramic surfaces, cinematic shadows, and Hasselblad optical depth.',
    description: `A prompt recipe designed specifically for modern image synthesis models. Creates photorealistic luxury studio shots with controlled soft-box lighting, tactile micro-textures, and realistic focal falloff.`,
    content: `Commercial luxury editorial studio photograph of {{product_subject}} resting on a raw off-white textured travertine slab, soft warm natural diffused morning window lighting casting long gentle shadows from the left, muted neutral palette with warm beige, limestone, and matte terracotta accents, shot on Hasselblad H6D-100c with 80mm f/2.8 lens, shallow depth of field, crisp focal clarity on primary hardware details, clean background with subtle architectural concrete grain, 8k resolution, photorealistic masterpiece, no CGI artifacts.`,
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    authorId: 'admin_seed',
    authorName: 'Elena Rostova',
    authorUsername: 'rostova_design',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    categoryId: 'image-generation',
    categoryName: 'Image Generation',
    tags: ['midjourney', 'gemini-image', 'editorial', 'minimalism'],
    status: 'published',
    visibility: 'public',
    featured: true,
    verified: true,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    publishedAt: Date.now() - 86400000,
    views: 1120,
    likesCount: 94,
    copiesCount: 310,
    bookmarksCount: 88,
    commentsCount: 4,
    aiModel: 'Gemini Image Preview / Midjourney v6',
    difficulty: 'beginner',
    variables: [
      { name: 'product_subject', label: 'Product Subject', defaultValue: 'matte black ceramic mechanical timepiece with sapphire crystal face', description: 'Object to render in the scene' }
    ]
  },
  {
    type: 'workflow',
    title: 'Systematic SEO Cluster & Semantic Topical Map Generator',
    slug: 'systematic-seo-cluster-semantic-topical-map',
    shortDescription: 'Builds a complete hub-and-spoke content architecture with search intent tags and schema markup.',
    description: `Engineered for content leads and SEO professionals. It organizes a core topic into primary pillar articles, supporting cluster articles, search intents, internal linking hierarchies, and JSON-LD FAQ schemas.`,
    content: `You are a Principal SEO Architect and Semantic Search Expert. For the primary entity "{{seed_entity}}", build an exhaustive, mathematically organized Semantic Topic Cluster.

Produce the response in clear Markdown tables:

### Pillar 1: Foundational Architecture
- **Primary Keyword:** {{seed_entity}} Definitive Guide
- **Search Intent:** Informational / Educational
- **Suggested Slug:** /guides/{{seed_entity}}
- **Core Entities to Ground:** {{seed_entity}}, Related Protocols, Industry Standards

### Cluster Group 2: Tactical Implementation (Hub & Spoke)
| Article Title | Search Intent | Target Volume Tier | Target Slug | Anchor Text back to Pillar |
|---|---|---|---|---|
| Step-by-Step Setup | Informational | High | /how-to/setup | "read full guide" |
| 7 Costly Mistakes to Avoid | Commercial Investigation | Medium | /common-mistakes | "architectural best practices" |
| Pricing & Total Cost of Ownership | Transactional | Low/High-intent | /pricing-breakdown | "enterprise roadmap" |

### Schema & Internal Graph Guidelines:
Generate standard JSON-LD Article Schema template for the pillar page.`,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    authorId: 'admin_seed',
    authorName: 'Marcus Vance',
    authorUsername: 'mvance',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    categoryId: 'marketing-sales',
    categoryName: 'Marketing & Sales',
    tags: ['seo', 'marketing', 'content', 'growth'],
    status: 'published',
    visibility: 'public',
    featured: false,
    verified: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    publishedAt: Date.now() - 86400000 * 5,
    views: 750,
    likesCount: 39,
    copiesCount: 115,
    bookmarksCount: 31,
    commentsCount: 0,
    aiModel: 'Gemini 3.5 Flash',
    difficulty: 'intermediate',
    variables: [
      { name: 'seed_entity', label: 'Target Entity / Topic', defaultValue: 'Vector Databases for RAG', description: 'Core domain or subject' }
    ]
  }
];

export async function seedInitialFirestoreData(isAdminUser = false): Promise<boolean> {
  // Never attempt client-side writes to admin-protected collections if user is not verified as admin
  if (!isAdminUser) {
    return false;
  }

  try {
    // Check if categories exist
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      console.log('Seeding initial categories into Firestore...');
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    // Check if resources exist
    const resSnap = await getDocs(collection(db, 'resources'));
    if (resSnap.empty) {
      console.log('Seeding initial curated resources into Firestore...');
      for (const res of INITIAL_RESOURCES) {
        const ref = doc(collection(db, 'resources'));
        await setDoc(ref, { ...res, id: ref.id });
      }
    }
    return true;
  } catch (err) {
    console.warn('Firestore seeding skipped or encountered non-blocking warning:', err);
    return false;
  }
}
