This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to the backend's `/api/v1` URL. The local server defaults to port 2000. Use the deployed HTTPS API URL in production.

Authentication screens share the Foodie auth layout and ordinary Tailwind form components. Signup has account and neighbourhood steps. Both applications read the same versioned location catalogue in `../shared/data`; include that directory when building from a checkout. See its README for data attribution and refresh instructions. Password recovery uses the backend's Nodemailer/SMTP setup documented in `../server/README.md`.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Signed-in experience

`components/app` contains the shared header, mobile navigation and profile state. Location editing is available only from Settings; the header displays the saved area beside the avatar. The shared editor lives in `components/location`. Discover uses the same food-inspiration catalogue and dish preview as the landing page. Search and category filters operate on that inspiration collection; no vendor/menu API is available yet. Kitchen availability and Ask Amaka are honest upcoming states. Settings wires the existing logout endpoint, then clears the local identity and returns to login.

Location pickers share the state/city directory and a separate 774-LGA snapshot under `shared/data`. Neighbourhood/street is optional free text. Device positioning is optional, requested only on a button click, and requires browser permission. The browser calls BigDataCloud’s free, keyless reverse-geocoding API with newly obtained, permissioned device coordinates to fill the form. Missing catalogue matches require manual selection. Never send stored or fixture coordinates to that free endpoint. See the shared data README for attribution, refresh scripts and accuracy limits.

## Daily Discover banner

Edit `src/data/discover-features.ts` to add or reorder complete banner entries: title, accent, supporting copy, language (`en` or Nigerian Pidgin `pcm`) and `dish: getDish("dish-id")`. Each entry reads its image, alt text and default fit from the shared dish catalogue in `src/data/food-inspiration.ts`, so they stay paired. Use optional `imageFit: "cover"` for wide food compositions with empty vertical margins. The ten entries alternate English and Pidgin; keep each headline pair in one language. The image and wording move together once per day at midnight in Africa/Lagos (UTC+1), including while the page stays open, and wrap at the end of the list. The rotation starts with the first entry on 23 October 2026. `src/data/assistant.ts` holds Amaka’s display name.

Run `npm test` for the daily date boundary/cycle and reverse-location mapping/failure checks. All external lookup responses are mocked; the free provider must never receive fixture coordinates.

## Food photography

The new Banga/starch, groundnut/eba, afang/eba, egusi/eba, Oha/akpu, ofada/ayamase, rice/stew and rice/beans images are generated originals, saved locally as high-resolution transparent PNGs. They replace the softer daily JPEGs and the previous Oha cutout. Existing jollof and small-chops images remain. Photo rendering uses quality 90 on the hero, food cards and detail previews.

We checked reusable web photography first. The Commons [BangaSoup photo](https://commons.wikimedia.org/wiki/File:BangaSoup.jpg) is CC BY-SA 4.0, but only 540 px wide and depicts eba rather than starch, so it is not included. No new third-party photograph is downloaded or reused in this update. Older unused source files are retained; this does not establish their provenance.

Culinary references for accurate food pairings and textures: [Sisi Yemmie’s Banga and starch recipe](https://www.youtube.com/watch?v=cZFbLtn6lO0), [Nigerian groundnut soup](https://www.allnigerianrecipes.com/soups/groundnut-soup/), and [Afang soup](https://www.allnigerianrecipes.com/soups/afang-soup/). These informed the brief; their photographs were not used as image inputs.

Current recommendations rotate daily. Morning/afternoon/evening selection remains future work.
