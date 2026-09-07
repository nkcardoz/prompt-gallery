import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  Bot,
  Zap,
  Layers,
  Image as ImageIcon,
  Compass,
  Bookmark,
  PlusCircle,
  FolderHeart,
  Settings,
  Shield,
  LogOut,
  LogIn,
  Menu,
  X,
  Search,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ResourceType } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile
}) => {
  const { user, profile, isAdmin, logout } = useAuth();

  const mainNavItems = [
    { id: 'home', label: 'Discover Home', icon: Compass },
    { id: 'prompts', label: 'Prompts', icon: Sparkles },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'workflows', label: 'Workflows', icon: Layers },
    { id: 'ai-images', label: 'AI Images', icon: ImageIcon },
    { id: 'grounded-search', label: 'Live Grounded AI', icon: Search },
    { id: 'collections', label: 'Collections', icon: BookOpen }
  ];

  const userNavItems = [
    { id: 'library', label: 'Saved Library', icon: Bookmark },
    { id: 'create', label: 'Publish Resource', icon: PlusCircle },
    { id: 'dashboard', label: 'Creator Studio', icon: FolderHeart }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-stone-200/80 bg-stone-50/70 backdrop-blur-md px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand / Logo */}
          <div className="flex items-center justify-between px-2">
            <div
              onClick={() => {
                onSelectTab('home');
                onCloseMobile();
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-tight text-stone-900">
                  PromptFoundry
                </span>
                <span className="text-[10px] font-medium tracking-wide text-stone-600 uppercase">
                  Discover • Build • Share
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            <div className="px-3 pb-1 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              Explore
            </div>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-700 font-semibold shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-600' : 'text-stone-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="mt-4 px-3 pb-1 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              Workspace
            </div>
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-700 font-semibold shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-600' : 'text-stone-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin CMS Access */}
            {isAdmin && (
              <>
                <div className="mt-4 px-3 pb-1 text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                  Administration
                </div>
                <button
                  id="nav-admin"
                  onClick={() => {
                    onSelectTab('admin');
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    currentTab === 'admin'
                      ? 'bg-rose-500/15 text-rose-700 font-semibold'
                      : 'text-rose-600 hover:bg-rose-500/10'
                  }`}
                >
                  <Shield className="h-4 w-4 text-rose-600" />
                  <span>Admin CMS Studio</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User Account / Footer */}
        <div className="border-t border-stone-200/80 pt-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <div
                onClick={() => {
                  onSelectTab('account');
                  onCloseMobile();
                }}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-stone-200/50 cursor-pointer transition-colors"
              >
                <img
                  src={
                    profile?.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
                  }
                  alt={profile?.displayName || 'User'}
                  className="h-8 w-8 rounded-full bg-stone-300 object-cover"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-stone-900 truncate">
                    {profile?.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-stone-500 truncate">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-xs text-stone-500">
                <button
                  onClick={() => {
                    onSelectTab('account');
                    onCloseMobile();
                  }}
                  className="flex items-center gap-1.5 hover:text-stone-800"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 hover:text-rose-600 text-stone-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                onSelectTab('login');
                onCloseMobile();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Join</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
