export interface FoodCategory {
  id: string;
  name: string;
}
export type DiscoveryMode = "nearby" | "city" | "location-required";
export interface Kitchen {
  vendorId: string;
  businessName: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  address: { city: string; area?: string; state: string };
  openingHours: { day: number; opensAt: string; closesAt: string }[];
  isOpen: boolean;
  isAcceptingOrders: boolean;
  isDemo: boolean;
  categories: string[];
  distanceMeters: number | null;
  canDeliver: boolean | null;
}
export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  hasMore: boolean;
}
export interface KitchenResults extends Page<Kitchen> {
  mode: DiscoveryMode;
  city?: string;
}
export interface MenuChoice {
  choiceId: string;
  name: string;
  price: number;
  isAvailable: boolean;
}
export interface MenuOption {
  optionId: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  choices: MenuChoice[];
}
export interface MenuItem {
  menuItemId: string;
  vendorId: string;
  name: string;
  description?: string;
  category: string;
  sectionId?: string;
  imageUrl?: string;
  price: number;
  currency: "NGN";
  isAvailable: boolean;
  canOrder: boolean;
  options: MenuOption[];
}
export interface MenuSection {
  id: string;
  name: string;
  count: number;
}
export interface KitchenMenuResults extends Page<MenuItem> {
  sections: MenuSection[];
  vendor: Kitchen;
  mode: DiscoveryMode;
}
export interface DiscoveryFilters {
  q: string;
  category: string;
  openOnly: boolean;
}

export interface DiscoveryMeal extends MenuItem {
  kitchen: Kitchen;
}
export interface MealResults extends Page<DiscoveryMeal> {
  mode: DiscoveryMode;
  city?: string;
}
export interface DiscoveryFeed {
  mode: DiscoveryMode;
  categories: (FoodCategory & { count: number })[];
  meals: DiscoveryMeal[];
}
