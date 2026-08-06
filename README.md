# A Little World

An interactive scroll journey — a puppy crosses ten worlds looking for a birthday
gift box. Scrolling drives each video frame by frame; at six moments the scroll
stops and waits for a tap or a swipe before the story continues.

## Run it locally

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>. A server is required — the preloader uses
`fetch()`, which the browser blocks on `file://`. (It falls back to plain video
streaming if you do open the file directly, but the progress bar won't be real.)

## Deploy to Vercel

```bash
npx vercel --prod
```

First run asks a few questions — accept the defaults; there's no build step and
no framework to pick. `vercel.json` already sets long cache headers on the media
so a second visit is instant.

To deploy from the dashboard instead, push this repo to GitHub and import it at
[vercel.com/new](https://vercel.com/new) — pick **Other** as the framework preset.

## How it's built

| File | What it does |
|------|--------------|
| `js/config.js` | **The whole story.** Text, scene order, videos, gates, timing. |
| `js/preloader.js` | Downloads every video into memory before anything starts. |
| `js/journey.js` | Scroll → video frame, text fades, gate locking, music. |
| `js/effects.js` | Particles, bursts, light flashes. |
| `css/style.css` | Everything visual. Each scene themes itself from four variables. |

Every video is fully downloaded up front — that's what the loading ring is for.
Once a video lives in a Blob, jumping to any frame is instant, which is the only
way scroll-scrubbing stays smooth on a phone. Total payload is about 20 MB, so
the first load wants Wi-Fi; after that it's cached.

## The ten scenes

| # | Scene | Video | Interaction |
|---|-------|-------|-------------|
| 1 | The Beginning | ✅ `01-beginning.mp4` | ENTER button |
| 2 | Ice World | ✅ `02-ice-world.mp4` | tap the crystal |
| 3 | Follow the Lights | ✅ `03-follow-the-lights.mp4` | tap 3 lights |
| 4 | Magic Forest | ✅ `04-magic-forest.mp4` | swipe up to open |
| 5 | Memories | ⬜ *needs `05-memories.mp4`* | tap 4 photos |
| 6 | Flower Land | ✅ `06-flower-land.mp4` | tap the butterfly |
| 7 | Sunset | ⬜ *needs `07-sunset.mp4`* | — |
| 8 | Your Name in the Stars | ⬜ *needs `08-stars.mp4`* | — |
| 9 | The Surprise | ✅ `09-surprise.mp4` | swipe up to open |
| 10 | Happy Birthday | ⬜ *needs `10-finale.mp4`* | replay |

Scenes without a video still run — they fall back to their own animated sky, so
nothing breaks while the rest of the footage is being made.

## Adding the rest

Drop the file in `videos/` using the name from the table, then in
`js/config.js` change that scene's line from:

```js
video: null,                    // ← videos/05-memories.mp4
```

to:

```js
video: 'videos/05-memories.mp4',
```

If the new footage already *shows* the thing she's meant to touch (a butterfly,
a door, the gift), add `hotspot: true` to that scene's `gate` — the interaction
becomes a ring of light over the footage instead of a drawn object on top of it.

## Adding real photos (scene 5)

Put them in `photos/`, then list them near the top of `js/config.js`:

```js
var PHOTOS = ['photos/us-1.jpg', 'photos/us-2.jpg', 'photos/us-3.jpg', 'photos/us-4.jpg'];
```

Square crops look best. With no photos listed you get glowing empty frames.
