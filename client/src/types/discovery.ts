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
  address: { city: string; area?: string; state: string };
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
  imageUrl?: string;
  price: number;
  currency: "NGN";
  isAvailable: boolean;
  canOrder: boolean;
  options: MenuOption[];
}
export interface KitchenMenuResults extends Page<MenuItem> {
  vendor: Kitchen;
  mode: DiscoveryMode;
}
export interface DiscoveryFilters {
  q: string;
  category: string;
  openOnly: boolean;
}
