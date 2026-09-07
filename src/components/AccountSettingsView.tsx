import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { User, Mail, Globe, Twitter, Github, Linkedin, Shield, Check, Save } from 'lucide-react';

export const AccountSettingsView: React.FC = () => {
  const { user, profile, updateUserProfile, isAdmin } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [twitter, setTwitter] = useState(profile?.socialLinks?.twitter || '');
  const [github, setGithub] = useState(profile?.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(profile?.socialLinks?.linkedin || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        website: website.trim(),
        photoURL: photoURL.trim(),
        socialLinks: {
          twitter: twitter.trim(),
          github: github.trim(),
          linkedin: linkedin.trim()
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Account & Profile Settings</h1>
        <p className="text-xs text-stone-500">
          Manage your public creator presence, credentials, and social links.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
        {/* Avatar preview */}
        <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
          <img
            src={
              photoURL ||
              profile?.photoURL ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
            }
            alt="Profile Avatar"
            className="w-16 h-16 rounded-full border border-stone-200 object-cover bg-stone-100"
          />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Username Handle</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-stone-400">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-stone-200 pl-7 pr-3 py-2 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="AI engineer, prompt crafter, systems architect..."
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        {/* Social Links */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Social Profiles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Personal Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mysite.com"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Twitter / X</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@handle"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">GitHub</label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="github username"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">LinkedIn</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin username"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-stone-500" />
            <span className="text-xs font-medium text-stone-700">Account Authorization:</span>
          </div>
          <span className="rounded-full bg-stone-200 px-3 py-0.5 text-xs font-semibold capitalize text-stone-800">
            {profile?.role || 'user'}
          </span>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <Check className="w-4 h-4" />
            <span>Profile saved successfully to Firestore!</span>
          </div>
        )}

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
