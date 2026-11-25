(() => {
  const origin = 'https://i.ytimg.com';
  function connect() {
    const hints = document.head.querySelectorAll('link[rel~=preconnect]');
    if ([...hints].some(link => link.href.replace(/\/$/, '') === origin && link.crossOrigin === null)) return;
    const hint = document.createElement('link');
    hint.rel = 'preconnect';
    hint.href = origin;
    document.head.append(hint);
  }
  if (document.head) connect();
  else {
    const observer = new MutationObserver(() => {
      if (document.head) { observer.disconnect(); connect(); }
    });
    observer.observe(document, { childList: true, subtree: true });
  }
  const selector = 'ytd-thumbnail img, yt-thumbnail-view-model img, img.ytCoreImageHost';
  const promoted = new Set();
  let timers = [];
  function prioritize() {
    if (document.hidden || promoted.size >= 4) return;
    const page = document.querySelector('ytd-page-manager > :not([hidden]):is(ytd-search,ytd-browse,ytd-watch-flexy)') || document;
    const images = page.querySelectorAll(selector);
    for (let i = 0; i < Math.min(images.length, 28) && promoted.size < 4; i++) {
      const img = images[i];
      if (promoted.has(img) || (img.complete && img.naturalWidth)) continue;
      if (!img.closest('ytd-thumbnail, yt-thumbnail-view-model, .yt-lockup-view-model__content-image, a[href*="/watch"], a[href*="/shorts/"]')) continue;
      const box = img.getBoundingClientRect();
      if (box.width < 80 || box.height < 44 || box.bottom <= 0 || box.top >= innerHeight || box.right <= 0 || box.left >= innerWidth) continue;
      img.setAttribute('fetchpriority', 'high');
      if (img.loading === 'lazy') img.loading = 'eager';
      promoted.add(img);
    }
  }
  function schedule() {
    timers.forEach(clearTimeout);
    timers = [0, 180, 650, 1600, 3500].map(delay => setTimeout(prioritize, delay));
  }
  document.addEventListener('yt-navigate-start', () => { timers.forEach(clearTimeout); promoted.clear(); });
  document.addEventListener('yt-navigate-finish', schedule);
  document.addEventListener('DOMContentLoaded', schedule, { once: true });
  schedule();
})();