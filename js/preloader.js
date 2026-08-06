/* ============================================================================
   PRELOADER
   ----------------------------------------------------------------------------
   Downloads every video + the music track fully into memory before the journey
   starts. That is the whole point: once a video lives in a Blob the browser can
   jump to any frame instantly, so scroll-scrubbing never stutters mid-story.

   Falls back gracefully to plain URLs when fetch() isn't allowed (opening the
   page straight off the filesystem), so the journey still runs either way.
   ========================================================================== */

window.Preloader = (function () {
  'use strict';

  var CHATTER = [
    'waking up the stars…',
    'freezing the ice world…',
    'hanging three little lights…',
    'unlocking the garden gate…',
    'dusting off old memories…',
    'planting every flower…',
    'holding the sunset still…',
    'spelling your name in the sky…',
    'wrapping the last gift…',
    'almost. don’t blink.'
  ];

  /* ── download one file, reporting bytes as they arrive ─────────────────── */
  function fetchBlob(url, onBytes) {
    return fetch(url, { cache: 'force-cache' }).then(function (res) {
      if (!res.ok) throw new Error(res.status + ' ' + url);

      var total = parseInt(res.headers.get('content-length') || '0', 10);
      onBytes(0, total);

      // No stream support (or no length header)? Take the blob in one gulp.
      if (!res.body || !res.body.getReader) {
        return res.blob().then(function (blob) {
          onBytes(blob.size, blob.size);
          return blob;
        });
      }

      var reader = res.body.getReader();
      var chunks = [];
      var seen = 0;

      return (function pump() {
        return reader.read().then(function (r) {
          if (r.done) return new Blob(chunks, { type: res.headers.get('content-type') || '' });
          chunks.push(r.value);
          seen += r.value.length;
          onBytes(seen, total);
          return pump();
        });
      })();
    });
  }

  /* ── make sure a <video> has real, seekable frames in hand ─────────────── */
  function primeVideo(url) {
    return new Promise(function (resolve) {
      var v = document.createElement('video');
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.src = url;

      var done = false;
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(bail);
        resolve(v);
      }

      // `loadeddata` means frame 0 is decoded and the element is scrub-ready.
      v.addEventListener('loadeddata', finish, { once: true });
      v.addEventListener('error', finish, { once: true });
      var bail = setTimeout(finish, 15000);   // never hang the whole party
      v.load();
    });
  }

  /**
   * @param {string[]} urls     every media file the journey needs
   * @param {function} onStep   (percent0to1, statusText) — UI callback
   * @returns {Promise<Object>} map of originalUrl → { url, el }
   */
  function load(urls, onStep) {
    var totals = {};      // url → bytes expected
    var loaded = {};      // url → bytes received
    var shown = 0;        // last percentage we displayed (never goes backwards)
    var chatter = 0;

    urls.forEach(function (u) { totals[u] = 0; loaded[u] = 0; });

    function report(stage) {
      var t = 0, l = 0, known = 0;
      urls.forEach(function (u) {
        if (totals[u]) { t += totals[u]; l += loaded[u]; known++; }
      });

      // Before any content-length lands, fall back to "files finished / files".
      var p = known
        ? (l / Math.max(t, 1)) * (known / urls.length) + ((urls.length - known) / urls.length) * 0
        : 0;

      // Downloading is 88% of the wait; decoding + fonts is the last 12%.
      p = Math.min(p, 1) * 0.88 + (stage || 0) * 0.12;
      shown = Math.max(shown, p);

      var idx = Math.min(CHATTER.length - 1, Math.floor(shown * CHATTER.length));
      if (idx !== chatter) chatter = idx;
      onStep(shown, CHATTER[chatter]);
    }

    var canFetch = location.protocol === 'http:' || location.protocol === 'https:';

    /* ── path A: real download with a real progress bar ─────────────────── */
    if (canFetch) {
      var jobs = urls.map(function (u) {
        return fetchBlob(u, function (seen, total) {
          totals[u] = total || Math.max(total, seen);
          loaded[u] = seen;
          report(0);
        }).then(function (blob) {
          return { key: u, url: URL.createObjectURL(blob) };
        }).catch(function () {
          return { key: u, url: u };            // network hiccup → stream it live
        });
      });

      return Promise.all(jobs).then(function (results) {
        var out = {};
        results.forEach(function (r) { out[r.key] = { url: r.url, el: null }; });

        var vids = results.filter(function (r) { return /\.mp4$/i.test(r.key); });
        var primed = 0;

        return Promise.all(vids.map(function (r) {
          return primeVideo(r.url).then(function (el) {
            out[r.key].el = el;
            primed++;
            report(primed / (vids.length + 1));
          });
        })).then(function () {
          return (document.fonts ? document.fonts.ready : Promise.resolve());
        }).then(function () {
          report(1);
          return out;
        });
      });
    }

    /* ── path B: file:// — no fetch allowed, lean on the <video> element ─── */
    var doneCount = 0;
    var vidUrls = urls.filter(function (u) { return /\.mp4$/i.test(u); });
    var out2 = {};
    urls.forEach(function (u) { out2[u] = { url: u, el: null }; });

    return Promise.all(vidUrls.map(function (u) {
      return primeVideo(u).then(function (el) {
        out2[u].el = el;
        doneCount++;
        onStep(Math.min(0.98, doneCount / vidUrls.length),
               CHATTER[Math.min(CHATTER.length - 1, doneCount)]);
      });
    })).then(function () {
      return (document.fonts ? document.fonts.ready : Promise.resolve());
    }).then(function () {
      onStep(1, CHATTER[CHATTER.length - 1]);
      return out2;
    });
  }

  return { load: load };
})();
