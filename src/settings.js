(async () => {
  const options = await browser.storage.local.get(fluideDefaults);
  const input = key => document.getElementById(key);
  for (const key of Object.keys(fluideDefaults)) {
    input(key).checked = options[key];
    input(key).addEventListener('change', async () => {
      const groups = [['h264', 'vp8', 'vp9', 'av1'], ['aac', 'opus']];
      if (groups.some(group => group.every(k => input(k).checked))) {
        input(key).checked = false;
        input('status').textContent = 'Keep at least one video codec and one audio codec available.';
        return;
      }
      await browser.storage.local.set({ [key]: input(key).checked });
      input('status').textContent = 'Setting saved. Reload the video.';
    });
  }
})();
