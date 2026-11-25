// Adapted from enhanced-h264ify. See LICENSE-enhanced-h264ify.txt (MIT).
(() => {
  const options = { ...fluideDefaults };
  browser.storage.local.get(fluideDefaults).then(saved => Object.assign(options, saved));
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const key of Object.keys(fluideDefaults)) {
      if (key in changes) options[key] = changes[key].newValue ?? fluideDefaults[key];
    }
  });
  const codecs = Object.entries({
    vp8: /\b(?:vp8|vp08)\b/i, vp9: /\b(?:vp9|vp09)\b/i,
    av1: /\b(?:av01|av1|av99)\b/i, h264: /\b(?:avc1|avc3|h264)\b/i,
    opus: /\bopus\b/i, aac: /\b(?:mp4a|aac)\b/i
  });
  function blocked(type) {
    if (!options.filter || typeof type !== 'string') return false;
    if (options.limitFps && /^video\//i.test(type)) {
      const fps = /;\s*framerate\s*=\s*"?([\d.]+)/i.exec(type);
      if (fps && Number(fps[1]) > 30) return true;
    }
    return codecs.some(([key, pattern]) => options[key] && pattern.test(type));
  }
  function wrap(target, name, unsupported) {
    if (!target || typeof target[name] !== 'function') return;
    const native = target[name];
    exportFunction(function (type) {
      if (blocked(type)) return unsupported;
      return Reflect.apply(native, this, arguments);
    }, target.wrappedJSObject, { defineAs: name });
  }
  wrap(window.HTMLMediaElement.prototype, 'canPlayType', '');
  wrap(window.MediaSource, 'isTypeSupported', false);
})();