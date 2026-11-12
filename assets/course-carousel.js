(function () {
  'use strict';
  var carousel = document.querySelector('.course-banners');
  if (!carousel) return;
  var track = carousel.querySelector('.course-banner-track');
  var slides = Array.from(track.children);
  var dots = Array.from(carousel.querySelectorAll('[data-banner-index]'));
  var pause = carousel.querySelector('[data-banner-pause]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = 0, timer, paused = reduced.matches, hovered = false;

  function go(index) {
    current = (index + slides.length) % slides.length;
    // Align banners to the start so every automatic step moves the track.
    track.scrollTo({ left: slides[current].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft, behavior: reduced.matches ? 'instant' : 'smooth' });
    dots.forEach(function (dot, i) { dot.setAttribute('aria-pressed', String(i === current)); });
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && !hovered && !document.hidden && !carousel.contains(document.activeElement)) {
      timer = setInterval(function () {
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) {
          go(0);
        } else {
          var step = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
          go(Math.round(track.scrollLeft / step) + 1);
        }
      }, 4000);
    }
  }
  function manual(index) { go(index); schedule(); }
  carousel.querySelector('[data-banner-prev]').addEventListener('click', function () { manual(current - 1); });
  carousel.querySelector('[data-banner-next]').addEventListener('click', function () { manual(current + 1); });
  dots.forEach(function (dot, i) { dot.addEventListener('click', function () { manual(i); }); });
  function updatePause() {
    pause.textContent = paused ? 'Resume rotation' : 'Pause rotation';
    pause.setAttribute('aria-pressed', String(paused));
    schedule();
  }
  pause.addEventListener('click', function () { paused = !paused; updatePause(); });
  carousel.addEventListener('mouseenter', function () { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', function () { hovered = false; schedule(); });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', function () { setTimeout(schedule, 0); });
  track.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); manual(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  track.addEventListener('pointerdown', function () { clearInterval(timer); });
  track.addEventListener('pointerup', schedule);
  track.addEventListener('pointercancel', schedule);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', function () { paused = reduced.matches; updatePause(); });
  updatePause();
})();
