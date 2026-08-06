/* ============================================================================
   A LITTLE WORLD — story configuration
   ----------------------------------------------------------------------------
   Everything you'd ever want to change lives in this one file.

   • To add a video later:  drop it in /videos and set `video:` on that scene.
     A scene with `video: null` still works — it falls back to its own animated
     sky, so the journey never breaks while you're still making footage.
   • To add real photos:  drop them in /photos and list them in PHOTOS below.
   • `length` = how many screen-heights of scrolling that scene lasts.
   • Text `in` / `out` are 0→1 positions inside the scene's own scroll.
   ========================================================================== */

window.JOURNEY = (function () {
  'use strict';

  /* ── who this is for ───────────────────────────────────────────────────── */
  var HER  = 'Asma';        // ← the name written in the stars (scene 08)
  var FROM = 'Mehdi';       // ← signature on the final card

  /* ── background music ──────────────────────────────────────────────────── */
  var MUSIC = { src: 'audio/silver-thread.mp3', volume: 0.55 };

  /* ── photos for the MEMORIES scene (scene 05) ──────────────────────────
     Put files in /photos and list them here, e.g.
        ['photos/us-1.jpg', 'photos/us-2.jpg', 'photos/us-3.jpg', 'photos/us-4.jpg']
     Leave empty and you'll get glowing empty frames instead — still pretty. */
  var PHOTOS = [];

  /* ── the ten scenes ────────────────────────────────────────────────────── */
  var SCENES = [

    /* 01 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'beginning',
      chapter: 'The Beginning',
      video: 'videos/01-beginning.mp4',
      length: 2.2,
      theme: { bg: '#04060f', tint: '#8fb4ff', glow: '#cfe0ff', ink: '#f4f7ff' },
      sky: 'night',
      particles: { type: 'star', count: 26 },
      lines: [
        { text: 'I made a little world for you…', in: 0.00, out: 0.62, size: 'lg' },
        { text: 'Come in. It only exists when you’re here.', in: 0.55, out: 1.00, size: 'sm' }
      ],
      // the ENTER button lives here — it is what starts everything
      gate: { type: 'start', at: 0.30, label: 'ENTER', hint: 'tap to start' }
    },

    /* 02 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'ice',
      chapter: 'Ice World',
      video: 'videos/02-ice-world.mp4',
      length: 2.6,
      theme: { bg: '#061527', tint: '#7fd4ff', glow: '#d6f2ff', ink: '#eaf7ff' },
      sky: 'frost',
      particles: { type: 'snow', count: 30 },
      lines: [
        { text: 'Something beautiful is<br>waiting ahead…', in: 0.02, out: 0.42, size: 'lg' },
        { text: 'But first, you have to<br>break a little ice.', in: 0.40, out: 0.62, size: 'sm' },
        { text: 'See? Cold things melt<br>around you.', in: 0.72, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.62, count: 1, target: 'crystal',
        hint: 'tap the crystal', reward: 0.16,
        says: ['One touch and the whole world warms up ❄']
      }
    },

    /* 03 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'lights',
      chapter: 'Follow the Lights',
      video: 'videos/03-follow-the-lights.mp4',
      length: 3.2,
      theme: { bg: '#050b1e', tint: '#ffd58a', glow: '#fff0cd', ink: '#fff8ec' },
      sky: 'night',
      particles: { type: 'spark', count: 20 },
      lines: [
        { text: 'Lights will show us<br>the way', in: 0.02, out: 0.38, size: 'lg' },
        { text: 'Three of them. One wish each.', in: 0.34, out: 0.54, size: 'sm' },
        { text: 'He caught every single one.<br>Because they were for you.', in: 0.80, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.54, count: 3, target: 'orb',
        hint: 'tap the lights', reward: 0.10,
        says: [
          'one — health, always ✨',
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
      length: 2.8,
      theme: { bg: '#170a2a', tint: '#c890ff', glow: '#ffc48a', ink: '#f8ecff' },
      sky: 'magic',
      particles: { type: 'firefly', count: 18 },
      lines: [
        { text: 'A door. In the middle<br>of nowhere.', in: 0.02, out: 0.40, size: 'lg' },
        { text: 'Push it. I dare you.', in: 0.38, out: 0.58, size: 'sm' },
        { text: 'A new world<br>has opened', in: 0.70, out: 1.00, size: 'lg' }
      ],
      gate: {
        type: 'swipe', at: 0.58, target: 'gate', hotspot: true,
        hint: 'swipe up to open', reward: 0.18,
        says: ['it was never locked — it was just waiting for you 🔑']
      }
    },

    /* 05 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'memories',
      chapter: 'Memories',
      video: null,                    // ← drop videos/05-memories.mp4 here later
      length: 3.0,
      theme: { bg: '#2a1030', tint: '#ffb36b', glow: '#ffe0b0', ink: '#fff3e6' },
      sky: 'ember',
      particles: { type: 'spark', count: 22 },
      photos: PHOTOS,
      lines: [
        { text: 'Every memory with you<br>is my favorite', in: 0.02, out: 0.40, size: 'lg' },
        { text: 'Which is a problem,<br>because there are so many.', in: 0.38, out: 0.56, size: 'sm' },
        { text: 'And we’re only getting started.', in: 0.80, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.56, count: 4, target: 'photo',
        hint: 'tap the photos', reward: 0.10,
        says: [
          'the day I stopped being nervous around you',
          'the laugh you make when you’re actually happy',
          'every ordinary evening that felt like something',
          'and this one — right now ♡'
        ]
      }
    },

    /* 06 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'flowers',
      chapter: 'Flower Land',
      video: 'videos/06-flower-land.mp4',
      length: 2.8,
      theme: { bg: '#3d1030', tint: '#ff8fc4', glow: '#ffd9ea', ink: '#fff0f7' },
      sky: 'bloom',
      particles: { type: 'petal', count: 26 },
      lines: [
        { text: 'You make everything<br>more beautiful', in: 0.02, out: 0.42, size: 'lg' },
        { text: 'Even a very confused<br>little dog.', in: 0.40, out: 0.58, size: 'sm' },
        { text: 'Everything you touch<br>decides to bloom.', in: 0.76, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.58, count: 1, target: 'butterfly', hotspot: true,
        hint: 'tap the butterfly', reward: 0.14,
        says: ['it landed on you first 🦋']
      }
    },

    /* 07 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'sunset',
      chapter: 'Sunset',
      video: null,                    // ← videos/07-sunset.mp4
      length: 2.4,
      theme: { bg: '#41172b', tint: '#ffab7a', glow: '#ffd9b8', ink: '#fff2e8' },
      sky: 'sunset',
      particles: { type: 'petal', count: 16 },
      lines: [
        { text: 'Some moments<br>don’t need words…', in: 0.04, out: 0.52, size: 'lg' },
        { text: 'This is one of them.', in: 0.50, out: 0.78, size: 'sm' },
        { text: 'Keep going. It gets better.', in: 0.78, out: 1.00, size: 'sm' }
      ],
      gate: null
    },

    /* 08 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'stars',
      chapter: 'Your Name in the Stars',
      video: null,                    // ← videos/08-stars.mp4
      length: 3.0,
      theme: { bg: '#0a0722', tint: '#d3b0ff', glow: '#ffffff', ink: '#f6f0ff' },
      sky: 'galaxy',
      particles: { type: 'star', count: 34 },
      signature: HER,                 // ← name drawn in starlight
      lines: [
        { text: 'I couldn’t reach the sky…', in: 0.02, out: 0.28, size: 'sm' },
        { text: 'so I rearranged it instead.', in: 0.26, out: 0.46, size: 'sm' },
        { text: 'You are my<br>whole universe', in: 0.66, out: 1.00, size: 'lg' }
      ],
      gate: null
    },

    /* 09 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'surprise',
      chapter: 'The Surprise',
      video: 'videos/09-surprise.mp4',
      length: 2.8,
      theme: { bg: '#33122e', tint: '#ff9ec4', glow: '#ffe3f0', ink: '#fff2f8' },
      sky: 'bloom',
      particles: { type: 'heart', count: 22 },
      lines: [
        { text: 'He carried it the<br>whole way here.', in: 0.02, out: 0.34, size: 'sm' },
        { text: 'The biggest gift<br>is for you', in: 0.32, out: 0.56, size: 'lg' }
      ],
      gate: {
        type: 'swipe', at: 0.56, target: 'gift', hotspot: true,
        hint: 'swipe up to open', reward: 0.24,
        says: ['♡']
      }
    },

    /* 10 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'finale',
      chapter: 'Happy Birthday',
      video: null,                    // ← videos/10-finale.mp4
      length: 1.6,
      theme: { bg: '#3a1338', tint: '#ffb3d9', glow: '#ffe6f4', ink: '#fff4fa' },
      sky: 'bloom',
      particles: { type: 'heart', count: 26 },
      finale: {
        script: 'Happy Birthday',
        name: 'My Love',
        body: [
          'Twenty-one looks unfairly good on you.',
          'I could give you a thousand gifts… but I wanted to give you a little world instead.',
          'A little world that exists only for you. ♡'
        ],
        sign: 'with everything, ' + FROM,
        replay: 'Replay our journey'
      },
      lines: [],
      gate: null
    }
  ];

  return {
    her: HER,
    from: FROM,
    music: MUSIC,
    photos: PHOTOS,
    scenes: SCENES
  };
})();
