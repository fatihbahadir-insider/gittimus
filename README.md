# Gittimus

**Version Control for Optimus** - A browser extension to track custom rule changes on the Insider platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Extension

```bash
# Production build
npm run build

# Development with auto-rebuild
npm run dev
```

### 3. Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` directory

## 📁 Project Structure

```
gittimus/
├── utils/              # Shared utilities
│   ├── constants.js    # Config & constants
│   ├── logger.js       # Logging utility
│   └── helpers.js      # Helper functions
│
├── content/            # Content script (source)
│   ├── index.js        # Main entry
│   ├── detector.js     # URL & button detection
│   ├── ui.js          # Badge injection
│   └── interceptor.js  # Network interception
│
├── background/         # Background service worker
│   ├── index.js        # Main entry
│   ├── storage.js      # Storage operations
│   └── tracker.js      # Tracking logic
│
├── popup/              # Popup interface
│   ├── popup.js        # Main entry
│   ├── ui.js          # UI rendering
│   └── actions.js      # Export/clear actions
│
├── dist/               # Build output (git ignored)
└── vite.config.js      # Build configuration
```

## 🛠️ Development

### Scripts

- `npm run dev` - Watch mode with auto-rebuild
- `npm run build` - Production build
- `./build.sh` - Build with instructions

### Source Files

All source files are in `content/`, `background/`, `popup/`, and `utils/` directories.

Vite automatically bundles:
- `content/index.js` → `dist/content.js` (IIFE for Chrome compatibility)
- `background/index.js` → `dist/background.js` (ES module)
- `popup/popup.js` → `dist/popup.js` (ES module)

### Hot Reload

While `npm run dev` is running, changes to source files will automatically rebuild. Reload the extension in Chrome to see changes.

## ✨ Features

- ✅ Automatic rule change detection
- ✅ Version history tracking
- ✅ Base64 decode/encode
- ✅ CREATE, UPDATE, DELETE tracking
- ✅ JSON export
- ✅ Storage usage monitoring
- ✅ Modular codebase

## 🔍 How It Works

1. **URL Detection**: Activates on Insider custom rules pages
2. **Button Detection**: Finds custom rules dropdown
3. **Badge Injection**: Adds 📌 track button
4. **Network Interception**: Captures API calls (fetch/XHR)
5. **Version Storage**: Saves old/new versions to chrome.storage.local
6. **Popup Display**: Shows version history with diff

## 📝 Usage

1. Navigate to: `https://inshoppingcart.inone.useinsider.com/custom/*/rules`
2. Select a custom rule
3. Click the 📌 badge to start tracking
4. Edit and save the rule
5. Open extension popup to view version history
6. Click version to view details (auto-copies to clipboard)
7. Export to JSON or clear history

## 🐛 Debugging

Each module logs with its own prefix:
- `[Gittimus Content]` - Content script logs
- `[Gittimus Background]` - Service worker logs
- `[Gittimus Popup]` - Popup logs

Open Chrome DevTools:
- **Page console**: Content script logs
- **Extension background**: Right-click extension → "Inspect service worker"
- **Popup**: Right-click extension → "Inspect popup"

## 📦 Tech Stack

- **Vite** - Fast bundler
- **ES6 Modules** - Modular code
- **Chrome Extension Manifest V3**
- **Vanilla JS** - No frameworks

## 📄 License

MIT
