(function () {
  'use strict';
  var cards = Array.from(document.querySelectorAll('.gallery-card'));
  var filters = Array.from(document.querySelectorAll('[data-gallery-filter]'));
  var viewer = document.getElementById('gallery-viewer');
  var media = viewer.querySelector('.gallery-viewer-media');
  var title = document.getElementById('gallery-viewer-title');
  var position = document.getElementById('gallery-position');
  var current = 0, opener, previousOverflow;
  function visible() { return cards.filter(function (card) { return !card.hidden; }); }
  function display(index) {
    var items = visible();
    current = (index + items.length) % items.length;
    var card = items[current];
    var button = card.querySelector('button');
    var previousVideo = media.querySelector('video');
    if (previousVideo) previousVideo.pause();
    media.replaceChildren();
    title.textContent = button.dataset.title;
    var element;
    if (card.dataset.kind === 'video') {
      element = document.createElement('video');
      element.controls = true;
      element.playsInline = true;
      element.preload = 'metadata';
      element.setAttribute('aria-label', button.dataset.title);
    } else {
      element = document.createElement('img');
      element.alt = card.querySelector('img').alt;
    }
    element.src = button.dataset.src;
    media.appendChild(element);
    position.textContent = (current + 1) + ' / ' + items.length;
  }
  cards.forEach(function (card) {
    card.querySelector('button').addEventListener('click', function () {
      opener = this;
      display(visible().indexOf(card));
      previousOverflow = document.documentElement.style.overflow;
      viewer.showModal();
      document.documentElement.style.overflow = 'hidden';
      viewer.querySelector('.gallery-close').focus();
    });
  });
  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      filters.forEach(function (filter) { filter.setAttribute('aria-pressed', String(filter === button)); });
      cards.forEach(function (card) { card.hidden = button.dataset.galleryFilter !== 'all' && card.dataset.kind !== button.dataset.galleryFilter; });
      document.getElementById('gallery-count').textContent = visible().length + (visible().length === 1 ? ' item' : ' items');
    });
  });
  viewer.querySelector('.gallery-close').addEventListener('click', function () { viewer.close(); });
  viewer.querySelector('[data-previous]').addEventListener('click', function () { display(current - 1); });
  viewer.querySelector('[data-next]').addEventListener('click', function () { display(current + 1); });
  viewer.addEventListener('keydown', function (event) {
    if (event.target.tagName === 'VIDEO') return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); display(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); display(current + 1); }
  });
  viewer.addEventListener('click', function (event) {
    var r = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) viewer.close();
  });
  viewer.addEventListener('close', function () {
    var video = media.querySelector('video');
    if (video) video.pause();
    media.replaceChildren();
    document.documentElement.style.overflow = previousOverflow || '';
    if (opener) opener.focus();
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('reveal-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    cards.forEach(function (card) { card.classList.add('reveal-pending'); observer.observe(card); });
  }
})();
