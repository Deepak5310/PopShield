// On install or update, re-register all blocked sites from storage
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.sync.get(['blockedSites']);
  const sites = result.blockedSites || [];
  for (const hostname of sites) {
    await registerScript(hostname);
  }
});

async function registerScript(hostname) {
  try {
    await chrome.scripting.registerContentScripts([{
      id: `popshield-${hostname}`,
      matches: [`*://${hostname}/*`, `*://*.${hostname}/*`],
      js: ['blocker.js'],
      runAt: 'document_start',
      world: 'MAIN'
    }]);
  } catch (e) {
    // Already registered — that's fine
  }
}
