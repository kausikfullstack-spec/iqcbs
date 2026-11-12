(function () {
  'use strict';

  var video = document.querySelector('.gurukul-feature-video video');
  if (!video || !('IntersectionObserver' in window)) return;

  var inView = false;
  video.muted = true;
  video.loop = true;

  function updatePlayback() {
    if (inView && !document.hidden) {
      var playback = video.play();
      if (playback) playback.catch(function () { /* Controls remain available if autoplay is blocked. */ });
    } else {
      video.pause();
    }
  }

  var observer = new IntersectionObserver(function (entries) {
    inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5;
    updatePlayback();
  }, { threshold: [0, 0.5] });

  observer.observe(video);
  document.addEventListener('visibilitychange', updatePlayback);
})();
