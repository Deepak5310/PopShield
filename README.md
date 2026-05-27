# 🛡️ PopShield

A lightweight Chrome extension that silently blocks unwanted popups and new tab redirects triggered by sneaky `onclick` scripts on third-party sites.

---

## 🚀 Features

- Blocks `window.open` popups and new tab redirects
- Manage blocked sites list from a clean popup UI
- Quick-block current tab's site in one click
- Sites persist across browser restarts
- Zero background resource usage (MV3 service worker sleeps when idle)

---

## 📁 File Structure

```
popshield/
├── manifest.json     # MV3 extension config
├── background.js     # Re-registers scripts on install/update
├── blocker.js        # Injected into page — overrides window.open
├── popup.html        # UI markup + styles
├── popup.js          # Add/remove sites logic
├── icon16.png
├── icon48.png
└── icon128.png
```

---

## 🔧 Installation (Developer Mode)

1. Download and extract the zip
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the `popshield` folder
5. Shield icon will appear in the toolbar ✅

---

## 📖 How to Use

**Quick block:**
Click the toolbar icon → hit **+ Block** next to the current site

**Manual add:**
Type any domain (e.g. `example.com`) in the input field → press **Add** or hit `Enter`

**Remove a site:**
Click the **Remove** button next to any site in the list

---

## 🧠 How It Works

Most popup blockers fail against `onclick`-based redirects because they run in an isolated world, separate from the page's JavaScript.

PopShield uses `chrome.scripting.registerContentScripts` with `world: "MAIN"` to inject `blocker.js` directly into the page's own JavaScript context — overriding `window.open` before any page script runs.

```
User adds site
      ↓
chrome.scripting.registerContentScripts (world: MAIN)
      ↓
blocker.js injected at document_start
      ↓
window.open = () => null   ← popup blocked ✅
```

---

## ⚙️ Tech Stack

- Manifest V3 (MV3)
- `chrome.scripting` — dynamic content script registration
- `chrome.storage.sync` — persistent site list
- Vanilla JS + HTML/CSS — no frameworks, no dependencies

---

## 📄 License

MIT
