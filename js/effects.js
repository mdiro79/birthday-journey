/* ============================================================================
   EFFECTS
   ----------------------------------------------------------------------------
   Every particle here is a plain DOM node animated by CSS keyframes, so the
   compositor owns it and the main thread stays free for video scrubbing.
   Counts are deliberately small — this is built for a phone, not a GPU rig.
   ========================================================================== */

window.FX = (function () {
  'use strict';

  var rand = function (a, b) { return a + Math.random() * (b - a); };

  var GLYPH = {
    heart: '♥',
    petal: '❀',
    star: '',
    snow: '',
    spark: '',
    firefly: ''
  };

  /* ── ambient particle field for one scene ──────────────────────────────── */
  function field(host, spec) {
    if (!spec || !spec.count) return;
    var layer = document.createElement('div');
    layer.className = 'pfield pfield--' + spec.type;
    layer.setAttribute('aria-hidden', 'true');

    var frag = document.createDocumentFragment();
    for (var i = 0; i < spec.count; i++) {
      var p = document.createElement('i');
      p.className = 'p';
      if (GLYPH[spec.type]) p.textContent = GLYPH[spec.type];

      var s = spec.type === 'star' ? rand(1, 2.6)
            : spec.type === 'snow' ? rand(3, 7)
            : spec.type === 'spark' ? rand(2, 4)
            : rand(8, 18);

      p.style.cssText =
        'left:' + rand(-4, 104).toFixed(2) + '%;' +
        'top:' + rand(-6, 100).toFixed(2) + '%;' +
        '--s:' + s.toFixed(2) + 'px;' +
        '--d:' + rand(5, 16).toFixed(2) + 's;' +
        '--delay:' + rand(-16, 0).toFixed(2) + 's;' +
        '--drift:' + rand(-40, 40).toFixed(0) + 'px;' +
        '--o:' + rand(0.25, 0.95).toFixed(2) + ';' +
        'font-size:' + s.toFixed(1) + 'px;';
      frag.appendChild(p);
    }
    layer.appendChild(frag);
    host.appendChild(layer);
    return layer;
  }

  /* ── one-shot celebration burst at a point on screen ───────────────────── */
  function burst(x, y, opts) {
    opts = opts || {};
    var n = opts.count || 18;
    var glyph = opts.glyph || null;
    var host = document.createElement('div');
    host.className = 'burst';
    host.setAttribute('aria-hidden', 'true');
    host.style.left = x + 'px';
    host.style.top = y + 'px';

    for (var i = 0; i < n; i++) {
      var b = document.createElement('i');
      var a = (i / n) * Math.PI * 2 + rand(-0.25, 0.25);
      var dist = rand(50, opts.spread || 150);
      if (glyph) { b.textContent = glyph; b.className = 'burst__glyph'; }
      b.style.cssText =
        '--tx:' + (Math.cos(a) * dist).toFixed(1) + 'px;' +
        '--ty:' + (Math.sin(a) * dist).toFixed(1) + 'px;' +
        '--bd:' + rand(0.6, 1.25).toFixed(2) + 's;' +
        '--bdelay:' + rand(0, 0.12).toFixed(2) + 's;' +
        '--bs:' + rand(3, 8).toFixed(1) + 'px;';
      host.appendChild(b);
    }

    document.body.appendChild(host);
    setTimeout(function () { host.remove(); }, 1600);
  }

  /* ── full-screen flash of light, used when a gate gives way ────────────── */
  function flash(color, ms) {
    var f = document.createElement('div');
    f.className = 'flash';
    f.setAttribute('aria-hidden', 'true');
    f.style.setProperty('--flash', color || '#fff');
    f.style.setProperty('--flash-ms', (ms || 900) + 'ms');
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, (ms || 900) + 120);
  }

  /* ── a soft haptic tick, where the device allows it ────────────────────── */
  function tap(pattern) {
    if (navigator.vibrate) { try { navigator.vibrate(pattern || 12); } catch (e) {} }
  }

  return { field: field, burst: burst, flash: flash, tap: tap };
})();
