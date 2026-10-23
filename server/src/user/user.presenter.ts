import { User } from "../domain/user.model";

export function publicUser(user: User) {
  const role = user.roles.includes("admin")
    ? "admin"
    : user.roles.includes("vendor")
      ? "vendor"
      : "user";
  return {
    _id: user._id.toString(),
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    profilePicture: user.profilePicture,
    location: user.location,
    roles: user.roles,
    role,
    isActive: user.isActive,
    favouriteVendors: user.favouriteVendors,
    favouriteFoods: user.favouriteFoods,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export type PublicUser = ReturnType<typeof publicUser>;
