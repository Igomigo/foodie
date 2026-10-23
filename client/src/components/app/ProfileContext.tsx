"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getUser, loginUser } from "@/config/axios";
import { getProfile } from "@/sevices/user.service";
import type { StoredUser, UserProfile } from "@/types/user";

const ProfileContext = createContext<{
  user: StoredUser | null;
  updateProfile: (profile: UserProfile) => void;
  profileError: boolean;
} | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profileError, setProfileError] = useState(false);

  function updateProfile(profile: UserProfile) {
    const cached = getUser();
    if (!cached || cached.userId !== profile.userId) return;
    const next = { ...cached, ...profile };
    loginUser(next);
    setUser(next);
    setProfileError(false);
  }

  useEffect(() => {
    const cached = getUser();
    if (!cached) return;
    setUser(cached);
    let active = true;
    getProfile(cached.userId)
      .then((profile) => {
        if (active) updateProfile(profile);
      })
      .catch(() => {
        if (active) setProfileError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        user,
        updateProfile,
        profileError,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const profile = useContext(ProfileContext);
  if (!profile)
    throw new Error("useProfile must be used inside ProfileProvider");
  return profile;
}
