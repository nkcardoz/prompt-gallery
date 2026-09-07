import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      const email = firebaseUser.email || '';
      const isAdminEmail = email.toLowerCase() === 'imailnitin.kulaye@gmail.com';

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // Check if admin email needs role enforcement
        if (isAdminEmail && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin', updatedAt: Date.now() });
          data.role = 'admin';
        }
        setProfile(data);
      } else {
        const username = email ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : `user_${firebaseUser.uid.slice(0, 6)}`;
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email,
          displayName: firebaseUser.displayName || username,
          username: username.toLowerCase(),
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
          role: isAdminEmail ? 'admin' : 'user',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastLoginAt: Date.now(),
          stats: {
            totalResources: 0,
            totalViews: 0,
            totalLikes: 0,
            totalCopies: 0
          }
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Failed to sync user profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        await syncUserProfile(currUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(cred.user);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserProfile(cred.user);
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await fbUpdateProfile(cred.user, { displayName: name });
    await syncUserProfile(cred.user);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    // Don't allow regular users to alter role
    if (profile?.role !== 'admin') {
      delete updates.role;
    }
    const cleanUpdates = { ...updates, updatedAt: Date.now() };
    await updateDoc(userRef, cleanUpdates);
    setProfile(prev => prev ? ({ ...prev, ...cleanUpdates }) : null);
  };

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user);
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === 'imailnitin.kulaye@gmail.com';
  const isCreator = isAdmin || profile?.role === 'creator';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isCreator,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        resetPassword,
        logout,
        updateUserProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
