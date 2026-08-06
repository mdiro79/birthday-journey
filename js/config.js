/* ============================================================================
   A LITTLE WORLD — story configuration
   ----------------------------------------------------------------------------
   Everything you'd ever want to change lives in this one file.

   One rule: every scene is a real puppy video. No filler scenes, no scenes
   the dog isn't in. Add footage by appending a scene here.

   • `length` = how many screen-heights of scrolling that scene lasts.
     Bigger number = the video moves SLOWER for the same finger travel.
     Roughly: 10 seconds of footage over `length` screens of scrolling.
   • Text `in` / `out` are 0→1 positions inside the scene's own scroll.
   ========================================================================== */

window.JOURNEY = (function () {
  'use strict';

  /* ── who this is for ───────────────────────────────────────────────────── */
  var HER  = 'Asma';        // ← her name, on the final card
  var FROM = 'Mehdi';       // ← who sent the dog, and who signs the card
  var DOG  = 'Barfi';       // ← the puppy's name. Change it here, it updates everywhere.

  /* ── background music ──────────────────────────────────────────────────── */
  var MUSIC = { src: 'audio/silver-thread.mp3', volume: 0.55 };

  /* ── how heavy the scroll feels ────────────────────────────────────────
     0 = video snaps to your finger (light, twitchy)
     1 = video drifts behind it     (heavy, cinematic)
     This is the "weight" dial. */
  var WEIGHT = 0.86;

  /* ── the scenes ────────────────────────────────────────────────────────── */
  var SCENES = [

    /* 01 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'beginning',
      chapter: 'The Beginning',
      video: 'videos/01-beginning.mp4',
      length: 4.0,
      theme: { bg: '#04060f', tint: '#8fb4ff', glow: '#cfe0ff', ink: '#f4f7ff' },
      sky: 'night',
      particles: { type: 'star', count: 22 },
      lines: [
        { text: 'This is ' + DOG + '.', in: 0.00, out: 0.40, size: 'lg' },
        { text: FROM + ' sent him<br>to find you.', in: 0.38, out: 0.70, size: 'sm' },
        { text: 'He knows the way.<br>All you have to do is follow.', in: 0.68, out: 1.00, size: 'sm' }
      ],
      gate: { type: 'start', at: 0.30, label: 'ENTER', hint: 'tap to start' }
    },

    /* 02 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'ice',
      chapter: 'Ice World',
      video: 'videos/02-ice-world.mp4',
      length: 5.6,
      theme: { bg: '#061527', tint: '#7fd4ff', glow: '#d6f2ff', ink: '#eaf7ff' },
      sky: 'frost',
      particles: { type: 'snow', count: 24 },
      lines: [
        { text: 'The first road<br>is a cold one.', in: 0.02, out: 0.34, size: 'lg' },
        { text: 'He walks it anyway.', in: 0.32, out: 0.58, size: 'sm' },
        { text: 'Small dog.<br>Very serious mission.', in: 0.62, out: 1.00, size: 'sm' }
      ],
      gate: null
    },

    /* 03 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'lights',
      chapter: 'Follow the Lights',
      video: 'videos/03-follow-the-lights.mp4',
      length: 6.4,
      theme: { bg: '#050b1e', tint: '#ffd58a', glow: '#fff0cd', ink: '#fff8ec' },
      sky: 'night',
      particles: { type: 'spark', count: 18 },
      lines: [
        { text: 'The lights know<br>where to go', in: 0.02, out: 0.32, size: 'lg' },
        { text: 'Three of them.<br>Help him catch each one.', in: 0.30, out: 0.52, size: 'sm' },
        { text: 'He got them all.<br>They were always for you.', in: 0.82, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.54, count: 3, target: 'orb',
        hint: 'tap the lights', reward: 0.09,
        says: [
          'one — good health, always ✨',
          'two — everything you dream of ✨',
          'three — me, staying right here ✨'
        ]
      }
    },

    /* 04 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'forest',
      chapter: 'Magic Forest',
      video: 'videos/04-magic-forest.mp4',
      length: 5.6,
      theme: { bg: '#170a2a', tint: '#c890ff', glow: '#ffc48a', ink: '#f8ecff' },
      sky: 'magic',
      particles: { type: 'firefly', count: 14 },
      lines: [
        { text: 'A door, in the middle<br>of nowhere.', in: 0.02, out: 0.34, size: 'lg' },
        { text: 'This is where he<br>needs your help.', in: 0.32, out: 0.55, size: 'sm' },
        { text: 'A new world<br>has opened', in: 0.74, out: 1.00, size: 'lg' }
      ],
      gate: {
        type: 'swipe', at: 0.58, target: 'gate', hotspot: true,
        hint: 'swipe up to open', reward: 0.16,
        says: ['it was never locked — it was waiting for you 🔑']
      }
    },

    /* 05 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'flowers',
      chapter: 'Flower Land',
      video: 'videos/06-flower-land.mp4',
      length: 5.6,
      theme: { bg: '#3d1030', tint: '#ff8fc4', glow: '#ffd9ea', ink: '#fff0f7' },
      sky: 'bloom',
      particles: { type: 'petal', count: 20 },
      lines: [
        { text: 'Almost there now.', in: 0.02, out: 0.30, size: 'lg' },
        { text: DOG + ' got distracted.<br>Honestly, fair.', in: 0.28, out: 0.55, size: 'sm' },
        { text: 'Everything you walk past<br>decides to bloom.', in: 0.78, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.58, count: 1, target: 'butterfly', hotspot: true,
        hint: 'tap the butterfly', reward: 0.13,
        says: ['it landed on you first 🦋']
      }
    },

    /* 06 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'surprise',
      chapter: 'The Surprise',
      video: 'videos/09-surprise.mp4',
      length: 8.0,
      theme: { bg: '#33122e', tint: '#ff9ec4', glow: '#ffe3f0', ink: '#fff2f8' },
      sky: 'bloom',
      particles: { type: 'heart', count: 20 },
      lines: [
        { text: 'This is the place<br>he was bringing you to.', in: 0.02, out: 0.28, size: 'sm' },
        { text: DOG + ' carried it<br>the whole way', in: 0.26, out: 0.50, size: 'lg' }
      ],
      gate: {
        type: 'swipe', at: 0.52, target: 'gift', hotspot: true,
        hint: 'swipe up to open', reward: 0.18,
        says: ['♡']
      },
      /* the last card rises over the final seconds of this same footage */
      finale: {
        in: 0.80,
        script: 'Happy Birthday',
        name: HER,
        body: [
          'Twenty-one looks unfairly good on you.',
          'I could have given you a thousand gifts. I sent you a little dog and a whole world instead.',
          'A world that only exists because you’re in it. ♡'
        ],
        sign: 'with everything, ' + FROM,
        replay: 'Replay our journey'
      }
    }
  ];

  return {
    her: HER,
    from: FROM,
    music: MUSIC,
    weight: WEIGHT,
    scenes: SCENES
  };
})();
