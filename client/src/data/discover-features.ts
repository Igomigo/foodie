import { getDish, type Dish } from "./food-inspiration";

export interface DiscoverFeature {
  title: string;
  accent: string;
  foods: string;
  language: "en" | "pcm";
  dish: Dish;
  imageFit?: "cover";
}

// Add or reorder complete entries here. Images and alt text come from the dish.
// English and Nigerian Pidgin entries alternate; each headline stays in one language.
export const discoverFeatures: DiscoverFeature[] = [
  {
    title: "This banga?",
    accent: "Na correct one.",
    foods:
      "Banga soup, catfish and yellow starch. Na proper enjoyment be this.",
    language: "pcm",
    dish: getDish("banga-and-starch"),
    imageFit: "cover",
  },
  {
    title: "Groundnut soup?",
    accent: "Eba is ready.",
    foods:
      "Rich groundnut soup and firm yellow eba. Give your usual soup a change.",
    language: "en",
    dish: getDish("groundnut-and-eba"),
  },
  {
    title: "Jollof don land.",
    accent: "Make we chop.",
    foods: "Smoky jollof, chicken and dodo. This plate go make sense.",
    language: "pcm",
    dish: getDish("party-jollof"),
  },
  {
    title: "A bowl of Oha.",
    accent: "Akpu on the side.",
    foods:
      "Tender oha leaves, rich broth and soft akpu. There’s your next swallow.",
    language: "en",
    dish: getDish("oha-and-akpu"),
  },
  {
    title: "Ofada dey here.",
    accent: "Ayamase follow.",
    foods: "Ofada rice, green ayamase and dodo. Na better combination be this.",
    language: "pcm",
    dish: getDish("ofada"),
  },
  {
    title: "In the mood for",
    accent: "a swallow?",
    foods: "Rich egusi soup and yellow eba. Take your time with this one.",
    language: "en",
    dish: getDish("egusi-and-eba"),
  },
  {
    title: "Rice don ready.",
    accent: "Dodo follow am.",
    foods: "White rice, beef stew and dodo. You fit say no to this one?",
    language: "pcm",
    dish: getDish("rice-and-stew"),
  },
  {
    title: "One puff-puff?",
    accent: "You know better.",
    foods:
      "Golden puff-puff, samosas and spring rolls. Start with something light.",
    language: "en",
    dish: getDish("small-chops"),
  },
  {
    title: "Afang don ready.",
    accent: "Eba dey wait.",
    foods:
      "Better afang soup with beef, smoked fish and solid eba. Make we chop.",
    language: "pcm",
    dish: getDish("afang-and-eba"),
  },
  {
    title: "Time for",
    accent: "a proper meal.",
    foods:
      "Rice, beans, rich stew and dodo. An everyday favourite for good reason.",
    language: "en",
    dish: getDish("rice-and-beans"),
  },
];

const dayInMilliseconds = 24 * 60 * 60 * 1000;
const nigeriaOffset = 60 * 60 * 1000; // Africa/Lagos is UTC+1, without daylight saving.
const firstDay = Date.UTC(2026, 9, 23) / dayInMilliseconds;

export function getDailyDiscoverFeature(date = new Date()) {
  const day = Math.floor((date.getTime() + nigeriaOffset) / dayInMilliseconds);
  const index =
    (((day - firstDay) % discoverFeatures.length) + discoverFeatures.length) %
    discoverFeatures.length;
  return discoverFeatures[index];
}

export function millisecondsUntilNextFoodDay(date = new Date()) {
  return (
    dayInMilliseconds - ((date.getTime() + nigeriaOffset) % dayInMilliseconds)
  );
}
