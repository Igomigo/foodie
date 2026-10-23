export const foodCategories = [
  "All cravings",
  "Rice bowls",
  "Soups & swallows",
  "Off the grill",
  "Small chops",
] as const;

export type FoodCategory = (typeof foodCategories)[number];

export interface Dish {
  id: string;
  name: string;
  category: FoodCategory;
  label: string;
  description: string;
  story: string;
  image: string;
  alt: string;
  notes: string[];
  contain?: boolean;
}

export const dishes: Dish[] = [
  {
    id: "party-jollof",
    name: "Party jollof & dodo",
    category: "Rice bowls",
    label: "THE PARTY STARTER",
    description: "That smoky flavour. You know the one.",
    story:
      "Smoky jollof, grilled chicken, and golden dodo. A party on a plate, even when the only occasion is a very good appetite.",
    image: "/images/landing-jollof.png",
    alt: "Smoky jollof rice, grilled chicken, and fried plantain in a ceramic bowl",
    notes: ["Smoky & savoury", "A party favourite", "Better with dodo"],
    contain: true,
  },
  {
    id: "banga-and-starch",
    name: "Banga soup & starch",
    category: "Soups & swallows",
    label: "THE DELTA CLASSIC",
    description: "Rich banga. Yellow starch. A proper pairing.",
    story:
      "Palm-fruit banga soup with catfish, served with soft yellow cassava starch. A familiar Niger Delta favourite, with all the flavour in that rich broth.",
    image: "/images/foodie-banga-starch.png",
    alt: "Palm-fruit banga soup with catfish in a clay bowl beside smooth yellow cassava starch",
    notes: ["Palm-fruit soup", "Catfish", "Yellow starch"],
    contain: true,
  },
  {
    id: "groundnut-and-eba",
    name: "Groundnut soup & eba",
    category: "Soups & swallows",
    label: "THE NUTTY FAVOURITE",
    description: "Rich groundnut soup. Solid yellow eba.",
    story:
      "A rich, nutty groundnut soup with beef, smoked fish and a little ugu, served with firm yellow eba. A good reason to give your usual soup a change.",
    image: "/images/foodie-groundnut-eba.png",
    alt: "Orange-brown groundnut soup with beef, smoked fish and greens beside firm yellow garri eba",
    notes: ["Made with groundnuts", "Beef & smoked fish", "Yellow eba"],
    contain: true,
  },
  {
    id: "afang-and-eba",
    name: "Afang soup & eba",
    category: "Soups & swallows",
    label: "THE LEAFY FAVOURITE",
    description: "A proper bowl of afang, with eba beside it.",
    story:
      "Finely shredded afang and waterleaf, with beef, cow skin and smoked fish in a rich, leafy soup. Firm yellow eba on the side, ready for every mouthful.",
    image: "/images/foodie-afang-eba.png",
    alt: "Dark green afang soup with beef, cow skin and smoked fish beside yellow garri eba",
    notes: ["Afang & waterleaf", "Rich & leafy", "Yellow eba"],
    contain: true,
  },
  {
    id: "egusi-and-eba",
    name: "Egusi soup & eba",
    category: "Soups & swallows",
    label: "THE SOUL WARMER",
    description: "Home, in one generous bowl.",
    story:
      "Rich egusi, leafy greens, and tender meat, with soft eba on the side. For the kind of lunch you take your time with.",
    image: "/images/foodie-egusi-eba.png",
    contain: true,
    alt: "Golden egusi soup with melon curds, greens, beef and smoked fish beside yellow garri eba",
    notes: ["Hearty & savoury", "A familiar favourite", "Slow-lunch energy"],
  },
  {
    id: "oha-and-akpu",
    name: "Oha soup & akpu",
    category: "Soups & swallows",
    label: "THE HOME COMFORT",
    description: "A proper bowl of Oha. Akpu on the side.",
    story:
      "Tender oha leaves in a rich, cocoyam-thickened soup, with beef, stockfish and soft akpu. A familiar favourite from the Igbo kitchen, made for taking your time.",
    image: "/images/foodie-oha-v2.png",
    alt: "Oha soup with torn leaves, beef, cow skin and stockfish beside white cassava akpu",
    notes: ["Rich & savoury", "Oha leaves", "An Igbo favourite"],
    contain: true,
  },
  {
    id: "suya",
    name: "Suya, with all the extras",
    category: "Off the grill",
    label: "THE EVENING PLAN",
    description: "A little yaji. A very good idea.",
    story:
      "Chargrilled beef, a generous dusting of yaji, and fresh onion on the side. The familiar flavour that turns a quick stop into the best part of your evening.",
    image: "/images/foodie-suya.png",
    alt: "Spiced Nigerian beef suya with fresh onion rings and tomato on a ceramic platter",
    notes: ["Smoky & spicy", "Yaji is the magic", "An evening favourite"],
  },
  {
    id: "ofada",
    name: "Ofada & ayamase",
    category: "Rice bowls",
    label: "THE LOCAL LEGEND",
    description: "Some flavours don’t need an introduction.",
    story:
      "Local ofada rice on a banana leaf, with green-pepper ayamase, assorted meat, a boiled egg and dodo. Bold flavours for a very good lunch decision.",
    image: "/images/foodie-ofada-ayamase.png",
    contain: true,
    alt: "Ofada rice on a banana leaf with green ayamase sauce, assorted meat, a boiled egg and fried plantain",
    notes: ["Bold & peppery", "Local rice", "A proper classic"],
  },
  {
    id: "small-chops",
    name: "Small chops, big enjoyment",
    category: "Small chops",
    label: "THE SOMETHING LIGHT",
    description: "One puff-puff is never the plan.",
    story:
      "Golden puff-puff, crisp samosas, and spring rolls. The party favourites that are just as welcome on an ordinary afternoon. Sharing is entirely your decision.",
    image: "/images/foodie-small-chops.png",
    alt: "Nigerian small chops with golden puff-puff, samosas, spring rolls, and pepper sauce",
    notes: [
      "Golden & crisp",
      "A party favourite",
      "Perfect for the middle of the day",
    ],
  },
  {
    id: "fish-and-rice",
    name: "Fish that means business",
    category: "Off the grill",
    label: "THE FULL PLATE",
    description: "For an appetite with serious plans.",
    story:
      "Seasoned fish, rice, and all the good things on the side. A full plate for the days when something light simply won’t do.",
    image: "/images/big-fish-white-rice.jpeg",
    alt: "A large seasoned fish served with white rice and colourful sides",
    notes: ["Bold & savoury", "A full plate", "For fish lovers"],
  },
  {
    id: "rice-and-stew",
    name: "Sunday rice & stew",
    category: "Rice bowls",
    label: "THE COMFORT CLASSIC",
    description: "Sunday energy. Any day of the week.",
    story:
      "Fluffy rice, rich red stew, and golden plantain. A familiar plate with all the comfort of a Sunday afternoon at home.",
    image: "/images/foodie-rice-stew.png",
    contain: true,
    alt: "White rice with rich red stew, meat, and fried plantain",
    notes: ["Rich & comforting", "A little pepper", "Feels like Sunday"],
  },
  {
    id: "rice-and-beans",
    name: "Rice, beans & the good stuff",
    category: "Rice bowls",
    label: "THE EVERYDAY FAVOURITE",
    description: "Simple things. Done very, very well.",
    story:
      "Rice and beans, fried plantain, and rich stew. Nothing complicated. Just a combination that has been making good lunch decisions for years.",
    image: "/images/foodie-rice-beans.png",
    contain: true,
    alt: "Rice, beans, golden plantain, and rich stew served in a black bowl",
    notes: [
      "Comfort in a bowl",
      "An everyday favourite",
      "All the good things",
    ],
  },
];

export function getDish(id: string): Dish {
  const dish = dishes.find((item) => item.id === id);
  if (!dish) throw new Error(`Unknown dish: ${id}`);
  return dish;
}
