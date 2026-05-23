'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '@/lib/types';
import { migrateIfNeeded } from '@/lib/storage';

const ACTIVE_PROFILE_KEY = 'recomp-active-profile';

interface ProfileContextValue {
  profile: Profile;
  setProfile: (p: Profile) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: 'bill',
  setProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>('bill');

  useEffect(() => {
    migrateIfNeeded();
    const stored = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (stored === 'bill' || stored === 'mel') setProfileState(stored);
  }, []);

  function setProfile(p: Profile) {
    setProfileState(p);
    localStorage.setItem(ACTIVE_PROFILE_KEY, p);
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
