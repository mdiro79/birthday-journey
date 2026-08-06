/* ============================================================================
   THE JOURNEY
   ----------------------------------------------------------------------------
   One continuous scroll. Scroll position drives each scene's video frame by
   frame; at a few moments the scroll stops and waits for her — a tap, a swipe —
   before the story is allowed to continue.
   ========================================================================== */

(function () {
  'use strict';

  var CFG    = window.JOURNEY;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // How much of the remaining distance the film closes each 60fps frame.
  // Low number = heavy, slow, cinematic. 1 = glued to the finger.
  var EASE = REDUCE ? 1 : Math.max(0.03, 1 - (CFG.weight != null ? CFG.weight : 0.86));

  var stage   = document.getElementById('stage');
  var hud     = document.getElementById('hud');
  var hudBar  = document.getElementById('hudBar');
  var hudChap = document.getElementById('hudChapter');
  var music   = document.getElementById('music');
  var soundBtn= document.getElementById('soundBtn');
  var scrollHint = document.getElementById('scrollHint');

  var scenes  = [];        // live scene records
  var started = false;
  var locked  = false;
  var lockY   = 0;
  var activeIdx = -1;

  // The light that lives on the seam between two worlds.
  var crossing = null, crossT = -1;

  /* ── small helpers ─────────────────────────────────────────────────────── */
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  function smoothstep(a, b, x) {
    if (b <= a) return x >= b ? 1 : 0;
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  // A camera doesn't move linearly. It leans into the move and lands softly —
  // easeIn for the world rushing away, easeOut for the one we settle into.
  // Quadratic, not cubic: a cubic hides almost all of the travel in the last
  // fifth of the move, which is exactly where the shot has already faded out.
  function easeIn(t)  { return t * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function setVH() {
    if (window.innerHeight > 0) {
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     BUILD — turn the config into DOM
     ══════════════════════════════════════════════════════════════════════ */
  function buildScene(def, i) {
    var sec = document.createElement('section');
    sec.className = 'scene scene--' + def.id;
    sec.id = 'scene-' + def.id;
    sec.dataset.index = i;
    sec.style.setProperty('--bg', def.theme.bg);
    sec.style.setProperty('--tint', def.theme.tint);
    sec.style.setProperty('--glow', def.theme.glow);
    sec.style.setProperty('--ink', def.theme.ink);
    sec.style.setProperty('--len', def.length);
    // Every pin is a fixed, full-screen layer now, so the only thing deciding
    // who is in front is this: the world she's walking into is always on top.
    sec.style.zIndex = i;
    sec.setAttribute('aria-label', 'Chapter ' + (i + 1) + ': ' + def.chapter);

    var pin = document.createElement('div');
    pin.className = 'pin';

    /* animated fallback sky — always there, video sits on top of it */
    var sky = document.createElement('div');
    sky.className = 'sky sky--' + (def.sky || 'night');
    sky.setAttribute('aria-hidden', 'true');
    pin.appendChild(sky);

    /* the video */
    var video = null;
    if (def.video) {
      video = document.createElement('video');
      video.className = 'film';
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('aria-hidden', 'true');
      pin.appendChild(video);
    }

    var grade = document.createElement('div');
    grade.className = 'grade';
    grade.setAttribute('aria-hidden', 'true');
    pin.appendChild(grade);

    if (!REDUCE) FX.field(pin, def.particles);

    /* interactive props live here */
    var props = document.createElement('div');
    props.className = 'props';
    pin.appendChild(props);

    /* the words */
    var copy = document.createElement('div');
    copy.className = 'copy';
    var lineEls = (def.lines || []).map(function (l) {
      var p = document.createElement('p');
      p.className = 'line line--' + (l.size || 'sm');
      p.innerHTML = l.text;
      copy.appendChild(p);
      return p;
    });
    pin.appendChild(copy);

    /* the last card — held back until the final seconds of the last video */
    var finaleEl = def.finale ? buildFinale(def.finale) : null;
    if (finaleEl) props.appendChild(finaleEl);

    sec.appendChild(pin);

    var rec = {
      def: def, el: sec, pin: pin, video: video, props: props,
      lines: lineEls, copy: copy, finale: finaleEl,
      gate: null, p: 0, sp: -1, dp: -1, duration: 0,
      op: -1, vis: null, flt: ''
    };

    if (def.gate) rec.gate = buildGate(rec, def.gate);

    return rec;
  }

  function buildFinale(f) {
    var card = document.createElement('div');
    card.className = 'finale';
    card.innerHTML =
      '<p class="finale__script">' + f.script + '</p>' +
      '<p class="finale__name">' + f.name + '</p>' +
      '<span class="finale__rule" aria-hidden="true">♡</span>' +
      f.body.map(function (b) { return '<p class="finale__body">' + b + '</p>'; }).join('') +
      '<p class="finale__sign">' + f.sign + '</p>' +
      '<button class="finale__replay" type="button">' + f.replay +
        ' <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4"/></svg>' +
      '</button>';

    card.querySelector('.finale__replay').addEventListener('click', replay);
    return card;
  }

  /* ══════════════════════════════════════════════════════════════════════
     GATES — the moments the story waits for her
     ══════════════════════════════════════════════════════════════════════ */
  var SPOTS = {
    orb:   [[50, 34], [30, 50], [68, 60]],
    crystal: [[50, 46]],
    butterfly: [[50, 42]]
  };

  var HOTSPOT_LABEL = {
    butterfly: 'Touch the butterfly',
    gate: 'Open the gate',
    gift: 'Open the gift'
  };

  function buildGate(rec, g) {
    var wrap = document.createElement('div');
    wrap.className = 'gate gate--' + g.type + ' gate--' + (g.target || 'x');

    var gate = {
      spec: g, el: wrap, done: false, hits: 0,
      need: g.count || 1, targets: [], says: null
    };

    if (g.type === 'start') {
      var btn = document.createElement('button');
      btn.className = 'enter';
      btn.type = 'button';
      btn.innerHTML = '<span>' + g.label + '</span><i aria-hidden="true">✦</i>';
      btn.addEventListener('click', function () { begin(); });
      wrap.appendChild(btn);

      var cap = document.createElement('p');
      cap.className = 'gate__hint';
      cap.textContent = g.hint;
      wrap.appendChild(cap);

    } else if (g.type === 'tap') {
      var spots = SPOTS[g.target] || SPOTS.orb;
      for (var i = 0; i < gate.need; i++) {
        var pos = spots[i % spots.length];
        var t = makeTarget(g.target, i, rec.def, g.hotspot);
        t.style.left = pos[0] + '%';
        t.style.top  = pos[1] + '%';
        t.style.setProperty('--n', i);
        bindTap(t, gate, i);
        wrap.appendChild(t);
        gate.targets.push(t);
      }
      wrap.appendChild(hintEl(g.hint, gate.need > 1 ? gate.need : 0));

    } else if (g.type === 'swipe') {
      var obj = makeTarget(g.target, 0, rec.def, g.hotspot);
      wrap.appendChild(obj);
      gate.targets.push(obj);
      wrap.appendChild(hintEl(g.hint, 0, true));
      bindSwipe(wrap, gate);
    }

    var toast = document.createElement('p');
    toast.className = 'gate__says';
    wrap.appendChild(toast);
    gate.says = toast;

    if (g.type !== 'start') {
      var rescue = document.createElement('button');
      rescue.className = 'gate__rescue';
      rescue.type = 'button';
      rescue.innerHTML = '<span>tap anywhere</span>';
      rescue.addEventListener('click', function () {
        gate.targets.forEach(function (t, n) {
          if (!t.classList.contains('is-caught')) setTimeout(function () { t.click(); }, n * 260);
        });
      });
      wrap.appendChild(rescue);
    }

    rec.pin.appendChild(wrap);
    return gate;
  }

  function hintEl(text, counter, swipe) {
    var h = document.createElement('div');
    h.className = 'gate__hint' + (swipe ? ' gate__hint--swipe' : '');
    h.innerHTML =
      (swipe ? '<svg class="gate__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15l7-7 7 7"/><path d="M5 21l7-7 7 7"/></svg>' : '') +
      '<span class="gate__label">' + text + '</span>' +
      (counter ? '<span class="gate__count"><b>0</b>/' + counter + '</span>' : '') +
      (swipe ? '' : '<svg class="gate__finger" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11V5.6a1.6 1.6 0 0 1 3.2 0V11m0-1.2a1.4 1.4 0 0 1 2.8 0V12m0-1a1.4 1.4 0 0 1 2.8 0v4.6a5.4 5.4 0 0 1-5.4 5.4h-1.5a4 4 0 0 1-3.2-1.6l-2.6-3.5a1.5 1.5 0 0 1 2.3-1.9L9 15.2"/></svg>');
    return h;
  }

  function makeTarget(kind, i, def, hotspot) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'prop prop--' + kind;

    // When the footage already shows the thing she's reaching for, drawing a
    // second one on top just fights the film. Give her a halo of light instead.
    if (hotspot) {
      el.className = 'prop prop--halo';
      el.innerHTML = '<span class="halo__ring"></span><span class="halo__ring halo__ring--2"></span>' +
                     '<span class="halo__dot"></span>';
      el.setAttribute('aria-label', HOTSPOT_LABEL[kind] || 'Touch here');
      return el;
    }

    if (kind === 'orb') {
      el.innerHTML = '<span class="orb__core"></span><span class="orb__halo"></span>';
      el.setAttribute('aria-label', 'Catch light ' + (i + 1));

    } else if (kind === 'crystal') {
      el.innerHTML = '<span class="crystal__body"></span><span class="crystal__shine"></span>';
      el.setAttribute('aria-label', 'Touch the crystal');

    } else if (kind === 'butterfly') {
      el.innerHTML = '<span class="wing wing--l"></span><span class="wing wing--r"></span><span class="bfly__body"></span>';
      el.setAttribute('aria-label', 'Touch the butterfly');

    } else if (kind === 'gate') {
      el.innerHTML = '<span class="door"><span class="door__leaf"></span><span class="door__light"></span></span>';
      el.setAttribute('aria-label', 'Open the gate');

    } else if (kind === 'gift') {
      el.innerHTML =
        '<span class="gift">' +
          '<span class="gift__glow"></span>' +
          '<span class="gift__lid"><span class="gift__bow"></span></span>' +
          '<span class="gift__box"><span class="gift__ribbon"></span></span>' +
        '</span>';
      el.setAttribute('aria-label', 'Open the gift');
    }
    return el;
  }

  function bindTap(el, gate, i) {
    el.addEventListener('click', function (ev) {
      if (gate.done || el.classList.contains('is-caught')) return;
      ev.preventDefault();
      el.classList.add('is-caught');
      gate.hits++;
      FX.tap(14);

      var r = el.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height / 2, {
        count: 16, spread: 130,
        glyph: gate.spec.target === 'photo' ? '♥' : null
      });

      var msg = (gate.spec.says || [])[i];
      if (msg) say(gate, msg);

      var c = gate.el.querySelector('.gate__count b');
      if (c) c.textContent = gate.hits;

      if (gate.hits >= gate.need) setTimeout(function () { clearGate(gate); }, 620);
    });
  }

  function bindSwipe(wrap, gate) {
    var y0 = null, fired = false;

    function start(y) { y0 = y; fired = false; }
    function move(y) {
      if (y0 === null || fired || gate.done) return;
      var d = y0 - y;
      if (d > 8) wrap.classList.add('is-pulling');
      wrap.style.setProperty('--pull', clamp(d / 90, 0, 1).toFixed(3));
      if (d > 78) { fired = true; open(); }
    }
    function end() { y0 = null; if (!fired) { wrap.classList.remove('is-pulling'); wrap.style.setProperty('--pull', 0); } }
    function open() {
      wrap.classList.add('is-opened');
      wrap.style.setProperty('--pull', 1);
      FX.tap([12, 40, 22]);
      FX.flash(getComputedStyle(wrap).getPropertyValue('--glow') || '#fff', 700);
      var r = wrap.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height * 0.45,
               { count: 26, spread: 220, glyph: gate.spec.target === 'gift' ? '♥' : null });
      var msg = (gate.spec.says || [])[0];
      if (msg) say(gate, msg);
      setTimeout(function () { clearGate(gate); }, 900);
    }

    wrap.addEventListener('touchstart', function (e) { start(e.touches[0].clientY); }, { passive: true });
    wrap.addEventListener('touchmove',  function (e) { move(e.touches[0].clientY); }, { passive: true });
    wrap.addEventListener('touchend', end);
    wrap.addEventListener('touchcancel', end);

    wrap.addEventListener('mousedown', function (e) { start(e.clientY); });
    window.addEventListener('mousemove', function (e) { if (y0 !== null) move(e.clientY); });
    window.addEventListener('mouseup', end);

    // tapping the prop works too — nobody should get stuck on a gift box
    gate.targets[0].addEventListener('click', function (e) {
      e.preventDefault();
      if (!fired && !gate.done) { fired = true; open(); }
    });
  }

  function say(gate, msg) {
    gate.says.textContent = msg;
    gate.says.classList.remove('is-on');
    void gate.says.offsetWidth;
    gate.says.classList.add('is-on');
  }

  /* gate satisfied → hand the scroll back and glide forward a little */
  function clearGate(gate) {
    if (gate.done) return;
    gate.done = true;
    gate.el.classList.add('is-done');

    var rec = scenes.filter(function (s) { return s.gate === gate; })[0];
    var push = (gate.spec.reward || 0.12) * scrollSpan(rec);
    unlock();
    glide(window.scrollY + push, REDUCE ? 0 : 1400);
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCROLL CONTROL
     ══════════════════════════════════════════════════════════════════════ */
  function scrollSpan(rec) {
    return Math.max(1, rec.el.offsetHeight - window.innerHeight);
  }

  var rescueTimer = null;

  /* which gate is holding the scroll right here? */
  function gateAt(y) {
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      if (!s.gate || s.gate.spec.type === 'start') continue;
      if (y >= s.el.offsetTop - 2 && y < s.el.offsetTop + s.el.offsetHeight) return s.gate;
    }
    return null;
  }

  function block(e) { e.preventDefault(); }
  function blockKeys(e) {
    if (/^(Arrow|Page|Home|End|Space| )/.test(e.key)) e.preventDefault();
  }

  /* A fling can carry her well past the moment she's meant to stop at, so the
     lock anchors to the gate itself and eases her back to it, rather than
     freezing wherever the momentum happened to run out. */
  function lockScroll(atY) {
    if (locked) return;
    locked = true;
    lockY = Math.round(atY);
    var over = window.scrollY - lockY;
    if (over > 4) glide(lockY, REDUCE ? 0 : Math.min(520, 160 + over * 0.6));
    else if (over < 0) window.scrollTo(0, lockY);
    document.body.classList.add('is-locked');

    // Nobody gets stranded. If she hasn't found the prop after a while, the
    // whole screen quietly becomes the button.
    clearTimeout(rescueTimer);
    rescueTimer = setTimeout(function () {
      var g = gateAt(lockY);
      if (g && !g.done) g.el.classList.add('is-rescued');
    }, 11000);
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    window.addEventListener('keydown', blockKeys);
  }

  function unlock() {
    if (!locked) return;
    locked = false;
    clearTimeout(rescueTimer);
    document.body.classList.remove('is-locked');
    window.removeEventListener('wheel', block, { passive: false });
    window.removeEventListener('touchmove', block, { passive: false });
    window.removeEventListener('keydown', blockKeys);
  }

  /* scripted scroll — this is what makes a cleared gate feel like a reward */
  var gliding = null;
  function glide(to, ms) {
    if (gliding) cancelAnimationFrame(gliding);
    var from = window.scrollY;
    var max = document.body.scrollHeight - window.innerHeight;
    to = clamp(to, 0, max);
    if (!ms) { window.scrollTo(0, to); gliding = null; return; }

    var t0 = performance.now();
    (function step(now) {
      var t = clamp((now - t0) / ms, 0, 1);
      window.scrollTo(0, from + (to - from) * easeInOut(t));
      gliding = t < 1 ? requestAnimationFrame(step) : null;
    })(t0);
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE FRAME LOOP — scroll position in, everything else out
     ══════════════════════════════════════════════════════════════════════ */
  function onScroll() {
    if (locked && !gliding && window.scrollY > lockY) window.scrollTo(0, lockY);
  }

  /* One loop owns every frame. Scroll events only guard the lock — they never
     drive the picture, so a stuttering fling can't stutter the film. */
  var looping = false, lastT = 0;
  function loop(now) {
    if (!looping) return;
    var dt = Math.min(64, now - lastT || 16);
    lastT = now;
    render(dt);
    requestAnimationFrame(loop);
  }
  function startLoop() {
    if (looping) return;
    looping = true; lastT = performance.now();
    requestAnimationFrame(loop);
  }
  function stopLoop() { looping = false; }

  /* Every pin is a fixed full-screen layer, so scenes no longer take turns
     sliding past the viewport — they occupy the same space and the camera
     travels between them. The one screen-height of scroll that sits between
     one pin's last frame and the next scene's first is the crossing: the shot
     she's leaving accelerates past the lens and blows out into light, and the
     next one grows up out of that light to meet her. */
  function render(dt) {
    dt = dt || 16.667;
    var y  = window.scrollY;
    var vh = window.innerHeight;
    var best = -1, bestOp = -1;
    var seam = 0, seamFrom = null, seamTo = null;

    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      var top  = s.el.offsetTop;
      var span = scrollSpan(s);
      var last = i === scenes.length - 1;

      // p — the scene's own scripted timeline. Words and gates hang off this,
      // so it keeps meaning exactly what it meant before.
      var p = clamp((y - top) / span, 0, 1);
      s.p = p;

      // a — arriving out of the previous crossing.  b — leaving into the next.
      // Each crossing is the one screen-height of scroll between two scenes.
      var a = i === 0 ? 1 : clamp((y - (top - vh)) / vh, 0, 1);
      var b = last    ? 0 : clamp((y - (top + span)) / vh, 0, 1);

      // Off-screen scenes stop painting entirely — that is what keeps the last
      // scenes as light as the first ones.
      var here = a > 0 && b < 1;
      s.el.classList.toggle('is-near', here);
      if (!here) { s.sp = -1; s.dp = -1; setLayer(s, 0); continue; }

      // fp — the film's own clock. It starts the moment she begins flying in
      // and keeps rolling as the shot passes the camera, so neither side of a
      // crossing is ever a frozen still.
      var f0 = i === 0 ? top : top - vh;
      var f1 = top + span + (last ? 0 : vh);
      var fp = clamp((y - f0) / (f1 - f0), 0, 1);

      // Damped follow: the film eases toward where the scroll says it should
      // be instead of teleporting there. This is the weight in the scroll.
      var k = 1 - Math.pow(1 - EASE, dt / 16.667);
      if (s.sp < 0) s.sp = fp;
      else { s.sp += (fp - s.sp) * k; if (Math.abs(fp - s.sp) < 0.0004) s.sp = fp; }
      if (s.dp < 0) s.dp = p;
      else { s.dp += (p - s.dp) * k; if (Math.abs(p - s.dp) < 0.0004) s.dp = p; }

      // Depth, never a slide. Leaving accelerates away from her; arriving
      // decelerates into place; in between, a slow push keeps the shot alive.
      var arrive = a >= 1 ? 1 : 0.90 + 0.10 * easeOut(a);
      var leave  = b <= 0 ? 1 : 1 + 0.95 * easeIn(b);
      var push   = 1 + 0.05 * s.sp;

      // The light is the film's own exposure, not a lamp switched on over it:
      // one shot burns out as it passes, the next one's eyes adjust. Kept
      // shallow — past about a third of a stop it stops reading as light in
      // the room and starts reading as a filter laid over the picture.
      var expo = b > 0 ? 0.40 * smoothstep(0.12, 0.95, b)
               : a < 1 ? 0.26 * (1 - smoothstep(0.04, 0.72, a))
               : 0;

      if (s.video) {
        s.video.style.transform = 'scale(' + (arrive * leave * push).toFixed(4) + ')';
        var flt = expo > 0.002
          ? 'brightness(' + (1 + expo).toFixed(3) + ') saturate(' + (1 - expo * 0.3).toFixed(3) + ')'
          : '';
        if (s.flt !== flt) { s.flt = flt; s.video.style.filter = flt; }
      }

      // The join itself: the outgoing pin holds full strength well into the
      // crossing and only gives way once the incoming one already covers the
      // screen, so there is never a frame with a hole in it.
      var op = (a >= 1 ? 1 : smoothstep(0.08, 0.72, a)) *
               (b <= 0 ? 1 : 1 - smoothstep(0.38, 1.00, b));
      setLayer(s, op);

      if (s.video && s.duration) {
        // `trim` cuts seconds off the head/tail of a clip. Some exports carry
        // stray frames at the very start; trimming past them is cheaper and
        // safer than re-encoding the file.
        var tr = s.def.trim || [0, 0];
        var t0 = tr[0], t1 = s.duration - tr[1];
        scrub(s.video, t0 + s.sp * (t1 - t0) * 0.999);
      }
      paintCopy(s, s.dp);
      if (s.finale) paintFinale(s, s.dp);
      if (s.gate) paintGate(s, p, y, span, top);

      // Whoever owns the most of the screen owns the chapter title.
      if (op > bestOp) { bestOp = op; best = i; }
      if (b > 0 && b < 1) { seam = b; seamFrom = s.def.theme; seamTo = scenes[i + 1].def.theme; }
    }

    paintCrossing(seam, seamFrom, seamTo);

    if (best !== activeIdx && best >= 0) {
      activeIdx = best;
      hudChap.textContent = (best + 1) + ' · ' + scenes[best].def.chapter;
      hudChap.classList.remove('is-on'); void hudChap.offsetWidth;
      hudChap.classList.add('is-on');
    }

    var max = document.body.scrollHeight - vh;
    hudBar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
  }

  /* One pin's presence on screen. Touching the DOM only when the number has
     actually moved is what keeps six full-screen layers affordable. */
  function setLayer(s, op) {
    if (Math.abs(s.op - op) > 0.002) {
      s.op = op;
      s.pin.style.opacity = op.toFixed(3);
    }
    var vis = op > 0.004;
    if (s.vis !== vis) {
      s.vis = vis;
      s.pin.style.visibility = vis ? '' : 'hidden';
    }
  }

  /* ── frame-accurate scrubbing without drowning the decoder ─────────────
     Never queue a second seek while one is in flight; remember where we want
     to be and go there the moment the previous seek reports back. This one
     rule is the difference between silk and a slideshow.                    */
  function scrub(v, t) {
    v._want = t;
    if (v._busy || v.readyState < 2) return;
    if (Math.abs(v.currentTime - t) < 0.03) return;
    v._busy = true;
    try { v.currentTime = t; } catch (e) { v._busy = false; }
  }

  function bindScrub(v) {
    v.addEventListener('seeked', function () {
      v._busy = false;
      if (v._want != null && Math.abs(v.currentTime - v._want) > 0.05) {
        v._busy = true;
        try { v.currentTime = v._want; } catch (e) { v._busy = false; }
      }
    });
    v.addEventListener('error', function () { v._busy = false; });
  }

  function paintCopy(s, p) {
    var defs = s.def.lines || [];
    for (var i = 0; i < defs.length; i++) {
      var l = defs[i], el = s.lines[i];
      var inA = smoothstep(l.in, l.in + 0.07, p);
      var out = 1 - smoothstep(l.out - 0.07, l.out, p);
      var o = inA * out;
      el.style.opacity = o.toFixed(3);
      el.style.transform = 'translate3d(0,' + ((1 - inA) * 26 - (1 - out) * 22).toFixed(1) + 'px,0)';
      el.style.filter = 'blur(' + ((1 - o) * 6).toFixed(2) + 'px)';
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    }
  }

  /* ── the light on the seam ─────────────────────────────────────────────
     The films do most of the work: one burns out as it passes the lens, the
     next comes up out of that. This layer is only the spill — the colour of
     the world she's leaving bleeding into the colour of the one ahead. It is
     deliberately weak and wide. A bright disc in the middle of the screen is
     what makes a transition look drawn on; light that has no edge and no
     centre you can point at is what makes it look filmed. */
  function paintCrossing(t, from, to) {
    if (t < 0.002 && crossT < 0.002) { crossT = 0; return; }   // touch no DOM
    crossT = t;

    // A bell, so the spill arrives and leaves with the camera rather than
    // snapping on at the cut.
    var bell = Math.sin(Math.PI * clamp(t, 0, 1));
    crossing.style.opacity = (Math.pow(bell, 0.9) * 0.3).toFixed(3);
    // It drifts toward her as she moves through it — light has depth too.
    crossing.style.transform = 'scale(' + (0.92 + t * 0.5).toFixed(3) + ')';
    if (from && to) {
      crossing.style.setProperty('--ca', from.glow);
      crossing.style.setProperty('--cb', to.tint);
    }
  }

  function paintFinale(s, p) {
    var t = smoothstep(s.def.finale.in, Math.min(1, s.def.finale.in + 0.13), p);
    s.finale.style.opacity = t.toFixed(3);
    s.finale.style.transform = 'translate3d(0,' + ((1 - t) * 30).toFixed(1) + 'px,0)';
    s.finale.style.pointerEvents = t > 0.9 ? 'auto' : 'none';
  }

  function paintGate(s, p, y, span, top) {
    var g = s.gate, spec = g.spec;
    if (spec.type === 'start') return;

    var near = smoothstep(spec.at - 0.16, spec.at - 0.01, p);
    g.el.style.setProperty('--near', near.toFixed(3));
    g.el.classList.toggle('is-live', near > 0.6 && !g.done);

    if (!g.done && p >= spec.at && started) lockScroll(top + spec.at * span);
  }

  /* ══════════════════════════════════════════════════════════════════════
     START / REPLAY / SOUND
     ══════════════════════════════════════════════════════════════════════ */
  function begin() {
    if (started) return;
    started = true;
    unlock();
    document.body.classList.add('is-playing');
    hud.setAttribute('aria-hidden', 'false');
    soundBtn.hidden = false;

    // Warm every decoder inside the user gesture — the last insurance against
    // a hitch the first time a scene scrolls into view.
    scenes.forEach(function (s) {
      if (!s.video) return;
      // Rewinding to 0 would put every clip back on the frame `trim` exists to
      // skip; send them home to their real first frame instead.
      var home = head(s.def) || 0.001;
      var pr = s.video.play();
      if (pr && pr.then) pr.then(function () { s.video.pause(); scrub(s.video, home); })
                           .catch(function () {});
      else { try { s.video.pause(); scrub(s.video, home); } catch (e) {} }
    });

    music.volume = 0;
    var pr = music.play();
    if (pr && pr.then) pr.then(fadeIn).catch(function () { soundBtn.classList.add('is-muted'); });
    else fadeIn();

    scenes[0].gate.el.classList.add('is-done');
    scrollHint.setAttribute('aria-hidden', 'false');
    scrollHint.classList.add('is-on');
    setTimeout(function () { scrollHint.classList.remove('is-on'); }, 5200);

    FX.tap([10, 60, 18]);
    startLoop();
  }

  function fadeIn() {
    soundBtn.classList.remove('is-muted');
    var target = CFG.music.volume, t0 = performance.now();
    (function step(now) {
      var t = clamp((now - t0) / 2600, 0, 1);
      music.volume = target * t;
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  soundBtn.addEventListener('click', function () {
    if (music.paused) { music.play(); soundBtn.classList.remove('is-muted'); }
    else { music.pause(); soundBtn.classList.add('is-muted'); }
  });

  function replay() {
    unlock();
    scenes.forEach(function (s) {
      if (!s.gate || s.gate.spec.type === 'start') return;
      s.gate.done = false;
      s.gate.hits = 0;
      s.gate.el.classList.remove('is-done', 'is-opened', 'is-pulling', 'is-live', 'is-rescued');
      s.gate.el.style.setProperty('--pull', 0);
      s.gate.says.classList.remove('is-on');
      s.gate.targets.forEach(function (t) { t.classList.remove('is-caught'); });
      var c = s.gate.el.querySelector('.gate__count b');
      if (c) c.textContent = '0';
    });
    glide(0, REDUCE ? 0 : 1600);
  }

  /* ══════════════════════════════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════════════════════════════ */
  /* Where a clip actually begins. Never 0 — see `trim` in the config. */
  function head(def) {
    return (def.trim && def.trim[0]) || 0;
  }

  function boot() {
    setVH();

    crossing = document.createElement('div');
    crossing.className = 'crossing';
    crossing.setAttribute('aria-hidden', 'true');
    document.body.appendChild(crossing);

    CFG.scenes.forEach(function (def, i) {
      var rec = buildScene(def, i);
      scenes.push(rec);
      stage.appendChild(rec.el);
    });

    var manifest = CFG.scenes.filter(function (d) { return d.video; })
                             .map(function (d) { return d.video; });
    manifest.push(CFG.music.src);

    var ring = document.getElementById('loadRing');
    var pct  = document.getElementById('loadPct');
    var stat = document.getElementById('loadStatus');
    var C = 2 * Math.PI * 54;
    ring.style.strokeDasharray = C;
    ring.style.strokeDashoffset = C;

    Preloader.load(manifest, function (p, text) {
      ring.style.strokeDashoffset = C * (1 - p);
      pct.textContent = Math.round(p * 100);
      if (text && stat.textContent !== text) stat.textContent = text;
    }).then(function (media) {

      // Hand each scene the element the preloader already decoded.
      scenes.forEach(function (s) {
        if (!s.def.video) return;
        var m = media[s.def.video];
        if (!m) return;
        var fresh = m.el || s.video;
        fresh.className = 'film';
        fresh.setAttribute('aria-hidden', 'true');
        if (m.el && s.video.parentNode) {
          s.video.parentNode.replaceChild(fresh, s.video);
          s.video = fresh;
        } else {
          s.video.src = m.url;
        }
        s.duration = isFinite(s.video.duration) ? s.video.duration : 0;
        bindScrub(s.video);
        s.video.addEventListener('durationchange', function () {
          if (isFinite(s.video.duration)) s.duration = s.video.duration;
        });
        // A <video> paints frame 0 the moment it has data, whatever the story
        // says. Park every clip on its real first frame now, behind the
        // preloader, so a trimmed head can never flash on screen later.
        scrub(s.video, head(s.def) || 0.001);
      });

      var mus = media[CFG.music.src];
      music.src = mus ? mus.url : CFG.music.src;

      document.body.classList.remove('is-booting');
      document.body.classList.add('is-ready');
      var pre = document.getElementById('preloader');
      pre.classList.add('is-gone');
      setTimeout(function () { pre.remove(); }, 1100);

      // Nothing moves until she presses ENTER — the first scene is a doorway,
      // not a page you can scroll past.
      window.scrollTo(0, 0);
      lockScroll(0);
      startLoop();
    }).catch(function (err) {
      document.getElementById('loadStatus').textContent =
        'something went wrong loading the world — try refreshing';
      console.error(err);
    });

    window.__J = { render: render, scenes: scenes, begin: begin,
                   loop: startLoop, halt: stopLoop };

    window.addEventListener('scroll', onScroll, { passive: true });
    // No point burning frames on a tab nobody is looking at.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopLoop(); else startLoop();
    });
    window.addEventListener('resize', function () { setVH(); render(); });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () { setVH(); render(); }, 260);
    });
  }

  boot();
})();
