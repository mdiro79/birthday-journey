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
  var HER  = 'Asma';        // ← her name, written in starlight at the end
  var FROM = 'Mehdi';       // ← signature on the final card

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
        { text: 'I made a little world<br>for you…', in: 0.00, out: 0.46, size: 'lg' },
        { text: 'It only exists<br>when you’re here.', in: 0.44, out: 0.78, size: 'sm' },
        { text: 'He’s been waiting all night.', in: 0.76, out: 1.00, size: 'sm' }
      ],
      gate: { type: 'start', at: 0.30, label: 'ENTER', hint: 'tap to start' }
    },

    /* 02 ─────────────────────────────────────────────────────────────────── */
    {
      id: 'ice',
      chapter: 'Ice World',
      video: 'videos/02-ice-world.mp4',
      // This clip used to open on two frames of a design mock-up — a grid of
      // phone screenshots that flashed on screen every time the story crossed
      // into it. Those frames are cut out of the file now, so there is nothing
      // left to trim past and the shot starts on its own first frame.
      length: 5.6,
      theme: { bg: '#061527', tint: '#7fd4ff', glow: '#d6f2ff', ink: '#eaf7ff' },
      sky: 'frost',
      particles: { type: 'snow', count: 24 },
      lines: [
        { text: 'Something beautiful is<br>waiting ahead…', in: 0.02, out: 0.34, size: 'lg' },
        { text: 'The road there is cold.<br>He doesn’t care.', in: 0.32, out: 0.55, size: 'sm' },
        { text: 'Cold things melt<br>around you.', in: 0.76, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.60, count: 1, target: 'crystal',
        hint: 'tap the ice', reward: 0.14,
        says: ['one touch and the whole world warms up ❄']
      }
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
        { text: 'Lights will show us<br>the way', in: 0.02, out: 0.32, size: 'lg' },
        { text: 'Three of them.<br>One wish each.', in: 0.30, out: 0.52, size: 'sm' },
        { text: 'He caught every one.<br>They were all for you.', in: 0.82, out: 1.00, size: 'sm' }
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
        { text: 'Push it. I dare you.', in: 0.32, out: 0.55, size: 'sm' },
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
        { text: 'You make everything<br>more beautiful', in: 0.02, out: 0.34, size: 'lg' },
        { text: 'Even a very confused<br>little dog.', in: 0.32, out: 0.55, size: 'sm' },
        { text: 'Everything you touch<br>decides to bloom.', in: 0.78, out: 1.00, size: 'sm' }
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
        { text: 'He carried it the<br>whole way here.', in: 0.02, out: 0.28, size: 'sm' },
        { text: 'The biggest gift<br>is for you', in: 0.26, out: 0.50, size: 'lg' }
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
          'I could give you a thousand gifts… but I wanted to give you a little world instead.',
          'A little world that exists only for you. ♡'
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
