// ── Storage helpers ──────────────────────────────────
async function getSites() {
  const result = await chrome.storage.sync.get(['blockedSites']);
  return result.blockedSites || [];
}

async function saveSites(sites) {
  await chrome.storage.sync.set({ blockedSites: sites });
}

// ── Content script registration ───────────────────────
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
    // Already registered — ignore
  }
}

async function unregisterScript(hostname) {
  try {
    await chrome.scripting.unregisterContentScripts({
      ids: [`popshield-${hostname}`]
    });
  } catch (e) {
    // Not registered — ignore
  }
}

// ── Add / Remove ─────────────────────────────────────
async function addSite(rawInput) {
  let hostname = rawInput.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  if (!hostname || !hostname.includes('.')) {
    showToast('Enter a valid domain (e.g. example.com)', true);
    return;
  }

  const sites = await getSites();
  if (sites.includes(hostname)) {
    showToast(`${hostname} already blocked`, true);
    return;
  }

  sites.push(hostname);
  await saveSites(sites);
  await registerScript(hostname);
  renderList(sites);
  showToast(`✓ ${hostname} blocked!`);
}

async function removeSite(hostname) {
  const sites = (await getSites()).filter(s => s !== hostname);
  await saveSites(sites);
  await unregisterScript(hostname);
  renderList(sites);
  showToast(`Removed ${hostname}`);
}

// ── Render ────────────────────────────────────────────
function renderList(sites) {
  const container = document.getElementById('sitesList');
  if (sites.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="icon">🛡️</div>
        No sites blocked yet.<br/>Add a site above to get started.
      </div>`;
    return;
  }

  container.innerHTML = sites.map(site => `
    <div class="site-item">
      <div class="site-dot"></div>
      <div class="site-name" title="${site}">${site}</div>
      <button class="btn-remove" data-site="${site}">Remove</button>
    </div>
  `).join('');

  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => removeSite(btn.dataset.site));
  });
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => { t.className = 'toast'; }, 2000);
}

// ── Current tab hostname ──────────────────────────────
async function loadCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    const url = new URL(tab.url);
    if (!['http:', 'https:'].includes(url.protocol)) return;

    const hostname = url.hostname.replace(/^www\./, '');
    document.getElementById('currentSite').textContent = hostname;

    const sites = await getSites();
    const btn = document.getElementById('quickAddBtn');
    if (sites.includes(hostname)) {
      btn.textContent = '✓ Blocked';
      btn.disabled = true;
    } else {
      btn.disabled = false;
      btn.addEventListener('click', () => addSite(hostname));
    }
  } catch (e) {
    document.getElementById('currentSite').textContent = 'N/A';
  }
}

// ── Call DOMContentLoaded ─────────────────────────────
async function syncScripts() {
  const sites = await getSites();
  const registered = await chrome.scripting.getRegisteredContentScripts();
  const registeredIds = new Set(registered.map(s => s.id));
  for (const site of sites) {
    if (!registeredIds.has(`popshield-${site}`)) {
      await registerScript(site);
    }
  }
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await syncScripts();
  const sites = await getSites();
  renderList(sites);
  loadCurrentTab();

  // Manual add
  document.getElementById('addBtn').addEventListener('click', () => {
    const val = document.getElementById('siteInput').value;
    document.getElementById('siteInput').value = '';
    addSite(val);
  });

  document.getElementById('siteInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value;
      e.target.value = '';
      addSite(val);
    }
  });
});
