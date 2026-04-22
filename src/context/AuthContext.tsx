import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type Role = 'user' | 'admin' | 'superadmin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isSuperAdmin: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const emailLower = currentUser.email?.toLowerCase() || '';
        const isSuperAdminEmail = emailLower === 'abdulohaaa.777@gmail.com' || emailLower === 'abdullohaaa.777@gmail.com';
        
        // Auto-provision or update user profile
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            let currentRole = data.role;
            
            // If email is superadmin but role in DB is different, update DB
            if (isSuperAdminEmail && currentRole !== 'superadmin') {
              await setDoc(userRef, { role: 'superadmin', updatedAt: serverTimestamp() }, { merge: true });
              currentRole = 'superadmin';
            }
            
            setProfile({ ...data, role: currentRole, uid: currentUser.uid });
          } else {
            // New user registration
            const effectiveRole = isSuperAdminEmail ? 'superadmin' : 'user';
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: effectiveRole,
            };
            await setDoc(userRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setProfile(newProfile);
          }
        } catch (err) {
          console.error("Error fetching/provisioning user:", err);
          // Fallback if read fails but they are super admin
          if (isSuperAdminEmail) {
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: 'superadmin'
            });
          } else {
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isSuperAdmin = profile?.role === 'superadmin';
  const isAdmin = isSuperAdmin || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isSuperAdmin, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
