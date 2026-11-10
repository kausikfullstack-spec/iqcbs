(function () {
  'use strict';
  var section = document.getElementById('institute-stats');
  if (!section) return;
  var student = section.querySelector('[data-student-count]');
  var started = false;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function animate(counter) {
    var target = Number(counter.dataset.count);
    var suffix = counter.dataset.suffix || '';
    if (reducedMotion.matches) {
      counter.textContent = target.toLocaleString('en-IN') + suffix;
      return;
    }
    var start;
    function frame(now) {
      if (start === undefined) start = now;
      var progress = Math.min((now - start) / 1600, 1);
      var value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      counter.textContent = value.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function begin() {
    if (started) return;
    started = true;
    section.querySelectorAll('[data-count]').forEach(animate);
  }
  fetch('data/stats.json').then(function (response) {
    if (!response.ok) throw new Error('Stats unavailable');
    return response.json();
  }).then(function (data) {
    if (!Number.isInteger(data.students) || data.students <= 0) return;
    student.dataset.count = data.students;
    student.dataset.suffix = '+';
    student.textContent = data.students.toLocaleString('en-IN') + '+';
    section.querySelector('[data-student-description]').textContent = 'Students trained';
    if (started) animate(student);
  }).catch(function () { /* Keep the non-numeric student community fallback. */ });
  if (!('IntersectionObserver' in window)) { begin(); return; }
  var observer = new IntersectionObserver(function (entries) {
    if (entries.some(function (entry) { return entry.isIntersecting; })) {
      begin();
      observer.disconnect();
    }
  }, { threshold: 0.3 });
  observer.observe(section);
})();
