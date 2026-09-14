/* ============================================================
   Rimjhim Dey — Portfolio
   Vanilla JS. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  // marks that scripting is live; every hidden-until-revealed rule keys off this
  document.documentElement.classList.add('js');
  clearTimeout(window.__revealFailsafe);   // script arrived; scroll reveals take over

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lerp    = function (a, b, t) { return a + (b - a) * t; };
  var clamp   = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ============================================================
     THEME
     ============================================================ */
  (function theme() {
    var root = document.documentElement, toggle = $('#themeToggle'), stored = null;
    try { stored = localStorage.getItem('rd-theme'); } catch (e) {}

    apply(stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));

    function apply(mode) {
      root.setAttribute('data-theme', mode);
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', mode === 'light' ? '#F4F4F9' : '#07070C');
    }
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      try { localStorage.setItem('rd-theme', next); } catch (e) {}
    });
  })();

  /* ============================================================
     SPLIT TEXT  (word-level, mask reveal)
     ============================================================ */
  function splitText(el) {
    if (el.dataset.splitDone) return;
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'split-word';
      var inner = document.createElement('i');
      inner.textContent = w;
      inner.style.transitionDelay = (i * 0.07) + 's';
      span.appendChild(inner);
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.dataset.splitDone = '1';
  }
  $$('[data-split]').forEach(splitText);

  /* ============================================================
     LOADER
     ============================================================ */
  (function loader() {
    var box = $('#loader'), bar = $('#loaderBar'), num = $('#loaderNum');
    if (!box) return;

    function finish() {
      box.classList.add('done');
      document.body.classList.remove('locked');
      // kick the hero in
      $$('.hero [data-anim], .hero [data-split]').forEach(function (el) { el.classList.add('in'); });
      setTimeout(function () { box.remove(); }, 800);
    }

    if (reduced) { box.remove(); $$('.hero [data-anim], .hero [data-split]').forEach(function (el) { el.classList.add('in'); }); return; }

    document.body.classList.add('locked');
    var p = 0;
    var timer = setInterval(function () {
      p = Math.min(100, p + Math.round(6 + Math.random() * 14));
      if (bar) bar.style.width = p + '%';
      if (num) num.textContent = (p < 10 ? '0' : '') + p;
      if (p >= 100) { clearInterval(timer); setTimeout(finish, 340); }
    }, 90);

    // hard stop so a slow font never traps the page
    setTimeout(function () { clearInterval(timer); if (!box.classList.contains('done')) finish(); }, 3200);
  })();

  /* ============================================================
     CURSOR + SPOTLIGHT + MAGNETIC  (single rAF loop)
     ============================================================ */
  var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var ringPos = { x: pointer.x, y: pointer.y };
  var dotPos  = { x: pointer.x, y: pointer.y };
  var magnets = [];

  (function pointerFx() {
    var dot = $('#cursorDot'), ring = $('#cursorRing'), spot = $('#spotlight');

    window.addEventListener('pointermove', function (e) {
      pointer.x = e.clientX; pointer.y = e.clientY;
      if (spot) {
        spot.style.setProperty('--sx', e.clientX + 'px');
        spot.style.setProperty('--sy', e.clientY + 'px');
      }
    }, { passive: true });

    if (!fine || reduced) return;
    document.body.classList.add('has-cursor');

    var hot = 'a, button, .card, input, textarea, .filter, .prof';
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest && e.target.closest(hot)) document.body.classList.add('cursor-hot');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest && e.target.closest(hot)) document.body.classList.remove('cursor-hot');
    });

    magnets = $$('.magnetic').map(function (el) { return { el: el, x: 0, y: 0, tx: 0, ty: 0, box: null }; });

    // rects are only re-measured on scroll / resize, never per frame
    var dirty = true;
    function markDirty() { dirty = true; }
    window.addEventListener('scroll', markDirty, { passive: true });
    window.addEventListener('resize', markDirty, { passive: true });

    (function frame() {
      dotPos.x  = lerp(dotPos.x,  pointer.x, 0.55);
      dotPos.y  = lerp(dotPos.y,  pointer.y, 0.55);
      ringPos.x = lerp(ringPos.x, pointer.x, 0.16);
      ringPos.y = lerp(ringPos.y, pointer.y, 0.16);

      if (dot)  dot.style.transform  = 'translate3d(' + dotPos.x + 'px,' + dotPos.y + 'px,0) translate(-50%,-50%)';
      if (ring) ring.style.transform = 'translate3d(' + ringPos.x + 'px,' + ringPos.y + 'px,0) translate(-50%,-50%)';

      if (dirty) {
        for (var k = 0; k < magnets.length; k++) {
          var mk = magnets[k];
          mk.box = mk.el.getBoundingClientRect();
          mk.bx = mk.x; mk.by = mk.y;   // offset the rect carried at measure time
        }
        dirty = false;
      }

      for (var i = 0; i < magnets.length; i++) {
        var m = magnets[i], b = m.box;
        if (!b || b.width === 0) continue;
        var cx = b.left + b.width / 2 - m.bx, cy = b.top + b.height / 2 - m.by;
        var dx = pointer.x - cx, dy = pointer.y - cy;
        var reach = Math.max(b.width, b.height) * 0.9 + 40;
        var d = Math.hypot(dx, dy);
        if (d < reach) { m.tx = clamp(dx * 0.18, -18, 18); m.ty = clamp(dy * 0.22, -14, 14); }
        else           { m.tx = 0; m.ty = 0; }
        m.x = lerp(m.x, m.tx, 0.18); m.y = lerp(m.y, m.ty, 0.18);
        if (Math.abs(m.x) > 0.05 || Math.abs(m.y) > 0.05) {
          m.el.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,' + m.y.toFixed(2) + 'px,0)';
        } else {
          m.el.style.transform = '';
        }
      }
      requestAnimationFrame(frame);
    })();
  })();

  /* ============================================================
     PARTICLE FIELD
     ============================================================ */
  (function field() {
    var cv = $('#field');
    if (!cv || reduced) { if (cv) cv.remove(); return; }

    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, dots = [], running = true;

    function size() {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var target = clamp(Math.round((w * h) / 24000), 24, 78);
      dots = [];
      for (var i = 0; i < target; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.5 + 0.7
        });
      }
    }

    function colors() {
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      return light
        ? { dot: 'rgba(103,66,245,.55)', line: '103,66,245', alpha: 0.16 }
        : { dot: 'rgba(165,139,255,.7)', line: '165,139,255', alpha: 0.26 };
    }

    function draw() {
      if (!running) return;
      var c = colors();
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];

        // cursor repulsion
        var dx = d.x - pointer.x, dy = d.y - pointer.y, dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 0.1) {
          var push = (130 - dist) / 130 * 0.6;
          d.x += (dx / dist) * push;
          d.y += (dy / dist) * push;
        }

        d.x += d.vx; d.y += d.vy;
        if (d.x < -20) d.x = w + 20; if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20; if (d.y > h + 20) d.y = -20;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = c.dot;
        ctx.fill();

        for (var j = i + 1; j < dots.length; j++) {
          var o = dots[j], lx = d.x - o.x, ly = d.y - o.y;
          var ld = lx * lx + ly * ly;
          if (ld < 20000) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = 'rgba(' + c.line + ',' + (c.alpha * (1 - ld / 20000)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) draw();
    });

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); }, { passive: true });

    size();
    draw();
  })();

  /* ============================================================
     REVEALS
     ============================================================ */
  (function reveals() {
    var els = $$('[data-anim], [data-split]').filter(function (el) { return !el.closest('.hero'); });
    if (!els.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -70px 0px' });
    els.forEach(function (el) { io.observe(el); });

    // safety net: nothing stays invisible if the observer never fires
    setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 6000);
  })();

  /* ============================================================
     COUNTERS
     ============================================================ */
  (function counters() {
    var els = $$('.count');
    if (!els.length) return;

    function run(el) {
      var to  = parseFloat(el.dataset.to);
      var dec = parseInt(el.dataset.dec || '0', 10);
      var plain = el.dataset.plain === '1';
      if (reduced) { el.textContent = plain ? String(to) : to.toFixed(dec); return; }

      var start = performance.now(), dur = 1500;
      (function step(now) {
        var t = clamp((now - start) / dur, 0, 1);
        var e = 1 - Math.pow(1 - t, 3);
        var v = to * e;
        el.textContent = plain ? String(Math.round(v)) : v.toFixed(dec);
        if (t < 1) requestAnimationFrame(step);
      })(start);
    }

    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ============================================================
     TILT + CARD SHEEN
     ============================================================ */
  (function tilt() {
    if (!fine || reduced) return;

    $$('.card').forEach(function (card) {
      var tiltable = card.classList.contains('tilt');

      card.addEventListener('pointermove', function (e) {
        var b = card.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width;
        var py = (e.clientY - b.top) / b.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        if (tiltable) {
          var rx = (0.5 - py) * 7, ry = (px - 0.5) * 9;
          card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-5px)';
        }
      });

      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  })();

  /* ============================================================
     HERO PARALLAX + TIMELINE DRAW + PROGRESS + NAV + RAIL
     ============================================================ */
  (function scrollFx() {
    var bar     = $('#nav');
    var burger  = $('#burger');
    var links   = $('#navLinks');
    var items   = $$('a[href^="#"]', links);
    var pill    = $('#navPill');
    var toTop   = $('#toTop');
    var progress= $('#progressBar');
    var rail    = $('#rail');
    var railLinks = $$('a', rail);
    var portrait  = $('#portrait');
    var tLine   = $('#timeline');
    var tFill   = $('#tLineFill');

    function closeMenu() {
      if (!links) return;
      links.classList.remove('open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    }
    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
      });
      items.forEach(function (a) { a.addEventListener('click', closeMenu); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }

    var sections = items.map(function (a) { return document.getElementById(a.hash.slice(1)); }).filter(Boolean);

    function movePill(a) {
      if (!pill || !a || window.innerWidth <= 800) { if (pill) pill.classList.remove('on'); return; }
      pill.style.width = a.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
      pill.classList.add('on');
    }

    var ticking = false;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      var docH = document.documentElement.scrollHeight - window.innerHeight;

      if (bar)   bar.classList.toggle('scrolled', y > 14);
      if (toTop) toTop.classList.toggle('show', y > 620);
      if (rail)  rail.classList.toggle('show', y > 400);
      if (progress) progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';

      if (portrait && !reduced) portrait.style.transform = 'translate3d(0,' + (-y * 0.05).toFixed(1) + 'px,0)';

      if (tLine && tFill) {
        var b = tLine.getBoundingClientRect();
        var seen = clamp((window.innerHeight * 0.75 - b.top) / b.height, 0, 1);
        tFill.style.height = (seen * 100).toFixed(1) + '%';
      }

      var active = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= 150) active = sections[i];
      }
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 60 && sections.length) {
        active = sections[sections.length - 1];
      }

      var activeLink = null;
      items.forEach(function (a) {
        var on = !!active && a.hash === '#' + active.id;
        a.classList.toggle('active', on);
        if (on) activeLink = a;
      });
      railLinks.forEach(function (a) {
        a.classList.toggle('active', a.hash === '#' + (active ? active.id : 'top'));
      });
      movePill(activeLink);

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    if (toTop) toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  })();

  /* ============================================================
     TYPED ROLES
     ============================================================ */
  (function typed() {
    var el = $('#typed');
    if (!el) return;

    var roles = [
      'machine-learning pipelines',
      'REST backends',
      'n8n workflow automations',
      'research benchmarks',
      'automation that removes work'
    ];
    if (reduced) { el.textContent = roles[0]; return; }

    var r = 0, c = 0, del = false;
    (function tick() {
      var word = roles[r];
      c += del ? -1 : 1;
      el.textContent = word.slice(0, c);
      var d = del ? 32 : 60;
      if (!del && c === word.length) { d = 1900; del = true; }
      else if (del && c === 0)       { del = false; r = (r + 1) % roles.length; d = 320; }
      setTimeout(tick, d);
    })();
  })();

  /* ============================================================
     PROJECT FILTER
     ============================================================ */
  (function filters() {
    var buttons = $$('.filter');
    var cards   = $$('#projectGrid .project');
    var empty   = $('#gridEmpty');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var want = btn.dataset.filter, shown = 0;

        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });

        cards.forEach(function (card) {
          var match = want === 'all' || card.dataset.cat === want;
          card.classList.toggle('is-hidden', !match);
          card.style.transform = '';
          if (match) {
            shown++;
            if (!reduced) {
              card.style.animation = 'none';
              void card.offsetWidth;
              card.style.animation = 'popIn .5s cubic-bezier(.22,1,.36,1) ' + (shown * 0.05).toFixed(2) + 's both';
            }
          }
        });

        if (empty) empty.hidden = shown !== 0;
      });
    });
  })();

  /* ============================================================
     CONTACT FORM → MAIL CLIENT
     ============================================================ */
  (function contact() {
    var form = $('#contactForm'), status = $('#formStatus');
    if (!form) return;
    var TO = 'rimjhimdey91@gmail.com';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = $('#cName').value.trim();
      var email   = $('#cEmail').value.trim();
      var subject = $('#cSubject').value.trim();
      var message = $('#cMessage').value.trim();

      var bad = [];
      [['#cName', name], ['#cEmail', email], ['#cSubject', subject], ['#cMessage', message]]
        .forEach(function (pair) {
          var wrapEl = $(pair[0]).closest('.field');
          var ok = pair[1].length > 0;
          if (pair[0] === '#cEmail') ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pair[1]);
          wrapEl.classList.toggle('invalid', !ok);
          if (!ok) bad.push(pair[0]);
        });

      if (bad.length) {
        status.textContent = 'Fill in every field with a valid email first.';
        status.className = 'form-status err';
        $(bad[0]).focus();
        return;
      }

      var body = message + '\n\n—\n' + name + '\n' + email;
      window.location.href = 'mailto:' + TO +
        '?subject=' + encodeURIComponent(subject) +
        '&body='    + encodeURIComponent(body);

      status.textContent = 'Opening your mail app… if nothing happens, write to ' + TO + ' directly.';
      status.className = 'form-status ok';
    });
  })();

  /* ---------------- footer year ---------------- */
  var yr = $('#year');
  if (yr) yr.textContent = String(new Date().getFullYear());

})();
