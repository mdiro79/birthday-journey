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

## The six scenes

| # | Scene | Video | Interaction |
|---|-------|-------|-------------|
| 1 | The Beginning | `01-beginning.mp4` | ENTER button |
| 2 | Ice World | `02-ice-world.mp4` | tap the ice |
| 3 | Follow the Lights | `03-follow-the-lights.mp4` | tap 3 lights |
| 4 | Magic Forest | `04-magic-forest.mp4` | swipe up to open |
| 5 | Flower Land | `06-flower-land.mp4` | tap the butterfly |
| 6 | The Surprise | `09-surprise.mp4` | swipe to open + final card |

Every scene is real footage — there are no filler scenes. The birthday card
rises over the closing seconds of scene 6 rather than getting a page of its own.

## Scroll weight

`WEIGHT` in `js/config.js` (0 → 1) is how far the film drifts behind her finger.
`0.86` is heavy and cinematic. Lower it if you want the video to track faster.

Scene `length` is the other dial: bigger number = more scrolling for the same
ten seconds of footage, so the picture moves slower.

## Adding more footage

Append a scene to `SCENES` in `js/config.js` with its `video`, `theme`, `lines`
and (optionally) a `gate`. If the new footage already *shows* the thing she's
meant to touch, add `hotspot: true` to the gate — the interaction becomes a ring
of light over the film instead of a drawn object on top of it.
