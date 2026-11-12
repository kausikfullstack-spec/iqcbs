(function () {
  'use strict';

  var videos = document.querySelectorAll('.gurukul-feature-video video');
  if (!videos.length || !('IntersectionObserver' in window)) return;

  videos.forEach(function (video) {

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
  });
})();
