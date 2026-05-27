// Runs in page's MAIN world — overrides window.open to block popups
window.open = function () {
  return null;
};
