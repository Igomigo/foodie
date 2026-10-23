export interface SavedLocation {
  country: string;
  state: string;
  city: string;
  countryCode?: string;
  stateCode?: string;
  cityId?: number;
  lga?: string;
  lgaCode?: string;
  area?: string;
  street1?: string;
  point?: { type: "Point"; coordinates: [number, number] };
  accuracyMeters?: number;
}

export interface UserProfile {
  userId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: string[];
  role: string;
  location?: SavedLocation;
}

export interface StoredUser extends UserProfile {
  accessToken: string;
}
