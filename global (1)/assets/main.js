(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');

  function closeNav() {
    if (nav) nav.classList.remove('open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
  }

  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function runCounters() {
    document.querySelectorAll('.js-counter').forEach(function (el) {
      var end = parseInt(el.getAttribute('data-end'), 10) || 0;
      if (reduceMotion) { el.textContent = end + '+'; return; }
      var cur = 0;
      var step = Math.max(1, Math.floor(end / 70));
      var iv = setInterval(function () {
        cur += step;
        if (cur >= end) { cur = end; clearInterval(iv); }
        el.textContent = cur + '+';
      }, 14);
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCounters);
  } else {
    runCounters();
  }

  function initSliders() {
    document.querySelectorAll('.slider').forEach(function (slider) {
      var track = slider.querySelector('.slider-track');
      var prev = slider.querySelector('[data-slide="prev"]');
      var next = slider.querySelector('[data-slide="next"]');
      if (!track || !prev || !next) return;

      function updateBtns() {
        var max = track.scrollWidth - track.clientWidth - 4;
        prev.disabled = track.scrollLeft <= 4;
        next.disabled = track.scrollLeft >= max;
      }

      function step(dir) {
        var card = track.querySelector('.slider-card');
        var amount = card ? card.clientWidth + 26 : track.clientWidth * 0.8;
        var target = Math.max(0, Math.min(track.scrollWidth, track.scrollLeft + dir * amount));
        track.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
      }

      prev.addEventListener('click', function () { step(-1); });
      next.addEventListener('click', function () { step(1); });
      track.addEventListener('scroll', updateBtns, { passive: true });
      window.addEventListener('resize', updateBtns);
      updateBtns();

      var keys = new Set(['ArrowLeft', 'ArrowRight']);
      slider.addEventListener('keydown', function (e) {
        if (!keys.has(e.key)) return;
        e.preventDefault();
        step(e.key === 'ArrowLeft' ? -1 : 1);
      });
    });
  }
  initSliders();
})();
