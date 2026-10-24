import { getUser, loginUser } from "@/config/axios";
import type { UserProfile } from "@/types/user";

export function getSavedProfile(): UserProfile | undefined {
  const user = getUser();
  if (!user) return undefined;
  // Keep authentication credentials out of the profile query cache.
  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    roles: user.roles,
    role: user.role,
    location: user.location,
  };
}

export function saveProfile(profile: UserProfile) {
  const session = getUser();
  if (session?.userId === profile.userId) loginUser({ ...session, ...profile });
}
