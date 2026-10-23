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
    id: "egusi-and-eba",
    name: "Egusi & a proper swallow",
    category: "Soups & swallows",
    label: "THE SOUL WARMER",
    description: "Home, in one generous bowl.",
    story:
      "Rich egusi, leafy greens, and tender meat, with soft eba on the side. For the kind of lunch you take your time with.",
    image: "/images/eba-and-egusi-soup.jpeg",
    alt: "Egusi soup with greens and meat beside golden eba",
    notes: ["Hearty & savoury", "A familiar favourite", "Slow-lunch energy"],
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
      "Local ofada rice, pepper-rich sauce, and a side of dodo. Bold, fragrant, and the sort of plate you remember long after lunch.",
    image: "/images/Ofada Rice and Sauce.jpeg",
    alt: "Ofada rice on a leaf with pepper sauce, meat, egg, and fried plantain",
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
    image: "/images/Rice meal.jpeg",
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
    image: "/images/native-rice-and-stew.jpeg",
    alt: "Rice, beans, golden plantain, and rich stew served in a black bowl",
    notes: [
      "Comfort in a bowl",
      "An everyday favourite",
      "All the good things",
    ],
  },
];
