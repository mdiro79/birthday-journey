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
  var DOG  = 'Barfi';       // ← the one who walks her there

  /* ── the voice ─────────────────────────────────────────────────────────
     Barfi does the talking. He was sent by Mehdi, he knows the way because
     Mehdi told him the way, and every gate is him asking her for something:
     touch this, follow me, push that. Nothing in the copy should sound like
     a caption — it should sound like a small dog explaining the route. */

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
      // The clip's own first four frames are a design mock-up with the old
      // opening line, "I made a little world for you…", painted into the
      // picture. This screen is the one place a parked film is held on frame
      // zero for as long as she likes, so that sentence used to be what she
      // read — and it would now sit right underneath Barfi introducing
      // himself. Start the shot after it. The file itself is untouched.
      trim: [0.21, 0],
      length: 4.0,
      theme: { bg: '#04060f', tint: '#8fb4ff', glow: '#cfe0ff', ink: '#f4f7ff' },
      sky: 'night',
      particles: { type: 'star', count: 22 },
      /* The scroll is locked until she presses ENTER, so the first line is the
         only one she reads standing still. It has to introduce him — and it
         has to be legible at p = 0, which a fade starting at 0.00 never is.
         A negative `in` puts it fully on screen before she moves a finger. */
      lines: [
        { text: 'Hello, ' + HER + '.<br>I’m ' + DOG + '.', in: -0.07, out: 0.46, size: 'lg' },
        { text: FROM + ' sent me. There’s<br>somewhere he wants<br>you to see.', in: 0.44, out: 0.78, size: 'sm' },
        { text: 'He told me the way.<br>Walk with me?', in: 0.76, out: 1.00, size: 'sm' }
      ],
      gate: { type: 'start', at: 0.30, label: 'ENTER', hint: 'tap to come with me' }
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
        { text: 'The first part of<br>the way is cold.', in: 0.02, out: 0.34, size: 'lg' },
        { text: FROM + ' warned me<br>about this bit.<br>I’ll go first.', in: 0.32, out: 0.55, size: 'sm' },
        { text: 'See? Cold things<br>melt around you.', in: 0.76, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.60, count: 1, target: 'crystal',
        hint: 'touch the ice', reward: 0.14,
        says: ['go on — it only opens for you ❄']
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
        { text: 'This way, ' + HER + '.<br>Follow the lights.', in: 0.02, out: 0.32, size: 'lg' },
        { text: 'Three of them. ' + FROM + '<br>hung one for<br>each wish.', in: 0.30, out: 0.52, size: 'sm' },
        { text: 'You caught all three.<br>They were always yours.', in: 0.82, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.54, count: 3, target: 'orb',
        hint: 'catch the lights', reward: 0.09,
        says: [
          'one — that you stay well, always ✨',
          'two — everything you’re hoping for ✨',
          'three — that he stays right here ✨'
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
        { text: 'Here’s the door<br>he told me about.', in: 0.02, out: 0.34, size: 'lg' },
        { text: 'I can’t reach the latch.<br>Push it up with me?', in: 0.32, out: 0.55, size: 'sm' },
        { text: 'A whole new world<br>has opened', in: 0.74, out: 1.00, size: 'lg' }
      ],
      gate: {
        type: 'swipe', at: 0.58, target: 'gate', hotspot: true,
        hint: 'swipe up to open it', reward: 0.16,
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
        { text: 'Almost there —<br>look what grew.', in: 0.02, out: 0.34, size: 'lg' },
        { text: FROM + ' planted the<br>first one. The rest<br>just followed.', in: 0.32, out: 0.55, size: 'sm' },
        { text: 'Everything you touch<br>decides to bloom.', in: 0.78, out: 1.00, size: 'sm' }
      ],
      gate: {
        type: 'tap', at: 0.58, count: 1, target: 'butterfly', hotspot: true,
        hint: 'say hello to her', reward: 0.13,
        says: ['she’s followed us since the gate 🦋']
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
        { text: 'I carried this the<br>whole way here.', in: 0.02, out: 0.28, size: 'sm' },
        { text: 'This is the place<br>he meant.', in: 0.26, out: 0.50, size: 'lg' }
      ],
      gate: {
        type: 'swipe', at: 0.52, target: 'gift', hotspot: true,
        hint: 'open it, it’s yours', reward: 0.18,
        says: ['♡']
      },
      /* the last card rises over the final seconds of this same footage —
         this is where Barfi hands her back and Mehdi does the talking */
      finale: {
        in: 0.80,
        script: 'Happy Birthday',
        name: HER,
        body: [
          DOG + ' did his part. He brought you the whole way here.',
          'Twenty-one looks unfairly good on you.',
          'I couldn’t hand you a thousand gifts — so I made you a little world, and sent someone to walk you through it. ♡'
        ],
        sign: 'with everything, ' + FROM,
        replay: 'Walk it again'
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
