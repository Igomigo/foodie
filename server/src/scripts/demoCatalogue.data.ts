// Fictional development businesses. Coordinates are public neighbourhood centres,
// not customer addresses or claims about real restaurants.
export const demoMeals = {
  jollof: {
    name: "Party jollof & chicken",
    description: "Smoky jollof rice with chicken and fried plantain.",
    category: "rice",
    imageUrl: "/images/landing-jollof.png",
    price: 450000,
  },
  banga: {
    name: "Banga soup & starch",
    description: "Palm-fruit soup with catfish and smooth yellow starch.",
    category: "soups-swallows",
    imageUrl: "/images/foodie-banga-starch.png",
    price: 550000,
  },
  groundnut: {
    name: "Groundnut soup & eba",
    description: "Rich groundnut soup with firm yellow eba.",
    category: "soups-swallows",
    imageUrl: "/images/foodie-groundnut-eba.png",
    price: 400000,
  },
  oha: {
    name: "Oha soup & akpu",
    description: "Tender oha leaves in a rich broth, with soft akpu.",
    category: "soups-swallows",
    imageUrl: "/images/foodie-oha-v2.png",
    price: 500000,
  },
  egusi: {
    name: "Egusi soup & eba",
    description: "Melon-seed soup with beef, leafy greens and yellow eba.",
    category: "soups-swallows",
    imageUrl: "/images/foodie-egusi-eba.png",
    price: 420000,
  },
  afang: {
    name: "Afang soup & eba",
    description: "Afang and waterleaf with smoked fish, beef and eba.",
    category: "soups-swallows",
    imageUrl: "/images/foodie-afang-eba.png",
    price: 480000,
  },
  ofada: {
    name: "Ofada rice & ayamase",
    description: "Ofada rice with green pepper sauce and dodo.",
    category: "rice",
    imageUrl: "/images/foodie-ofada-ayamase.png",
    price: 450000,
  },
  stew: {
    name: "Rice, beef stew & dodo",
    description: "White rice, slow-cooked beef stew and sweet fried plantain.",
    category: "rice",
    imageUrl: "/images/foodie-rice-stew.png",
    price: 350000,
  },
  chops: {
    name: "Small chops box",
    description: "Golden puff-puff, samosas and spring rolls.",
    category: "bakery-snacks",
    imageUrl: "/images/foodie-small-chops.png",
    price: 300000,
  },
  suya: {
    name: "Beef suya",
    description: "Spiced grilled beef with sliced onions and tomatoes.",
    category: "grills",
    imageUrl: "/images/foodie-suya.png",
    price: 350000,
  },
};

export type DemoMeal = keyof typeof demoMeals;
interface DemoKitchen {
  slug: string;
  name: string;
  description: string;
  city: string;
  state: string;
  area: string;
  coordinates: [number, number];
  radius: number;
  meals: DemoMeal[];
  closed?: boolean;
  pending?: boolean;
}
export const demoKitchens: DemoKitchen[] = [
  {
    slug: "osas",
    name: "Osas Kitchen",
    description: "Banga, starch and a little taste of home.",
    city: "Benin City",
    state: "Edo",
    area: "GRA",
    coordinates: [5.614, 6.303],
    radius: 9000,
    meals: ["banga", "jollof", "groundnut"],
  },
  {
    slug: "soup-pot",
    name: "The Soup Pot",
    description: "Good soup. Proper swallow. Nothing rushed.",
    city: "Benin City",
    state: "Edo",
    area: "Ring Road",
    coordinates: [5.628, 6.328],
    radius: 7000,
    meals: ["oha", "egusi", "afang", "groundnut", "banga"],
  },
  {
    slug: "rice-room",
    name: "The Rice Room",
    description: "Your everyday rice favourites, made with care.",
    city: "Benin City",
    state: "Edo",
    area: "Airport Road",
    coordinates: [5.625, 6.315],
    radius: 6000,
    meals: ["jollof", "ofada", "stew", "chops"],
  },
  {
    slug: "ugbowo",
    name: "Ugbowo Bites",
    description: "A proper lunch for your busy day.",
    city: "Benin City",
    state: "Edo",
    area: "Ugbowo",
    coordinates: [5.607, 6.394],
    radius: 5000,
    meals: ["stew", "egusi", "chops"],
  },
  {
    slug: "corner-grill",
    name: "Corner Grill",
    description: "Off the grill, straight to your next craving.",
    city: "Benin City",
    state: "Edo",
    area: "Ikpoba Hill",
    coordinates: [5.665, 6.339],
    radius: 7000,
    meals: ["suya", "jollof", "chops"],
  },
  {
    slug: "night-bowl",
    name: "Night Bowl",
    description: "An example of a kitchen that is currently closed.",
    city: "Benin City",
    state: "Edo",
    area: "GRA",
    coordinates: [5.62, 6.32],
    radius: 8000,
    meals: ["ofada", "oha"],
    closed: true,
  },
  {
    slug: "ikeja",
    name: "Ikeja Lunch Club",
    description: "Rice bowls and familiar favourites.",
    city: "Ikeja",
    state: "Lagos",
    area: "Ikeja",
    coordinates: [3.3515, 6.597],
    radius: 5000,
    meals: ["jollof", "ofada", "chops"],
  },
  {
    slug: "abuja",
    name: "Capital Kitchen",
    description: "A little comfort in every bowl.",
    city: "Abuja",
    state: "Federal Capital Territory",
    area: "Wuse",
    coordinates: [7.488, 9.064],
    radius: 5000,
    meals: ["stew", "afang"],
  },
  {
    slug: "pending",
    name: "Pending Kitchen",
    description: "Visibility test: this kitchen must stay hidden.",
    city: "Benin City",
    state: "Edo",
    area: "GRA",
    coordinates: [5.62, 6.32],
    radius: 8000,
    meals: ["jollof"],
    pending: true,
  },
];
