# ZxStudio — Plugin Publishing & Documentation Hub

This build keeps **ZxStudio** as the main site identity. Plugins are the published projects inside it, and each plugin can have its own wiki.

## Current UI changes
- Full-height documentation sidebar is also visible on the **homepage**.
- Sidebar follows the requested Artillex-style structure: utility links, plugin documentation tree, search, and grouped wiki pages.
- Plugin names open the plugin wiki directly.
- Plugin arrows expand/collapse the plugin's wiki pages.
- **ZxCrates stays open in the sidebar** and cannot be collapsed.
- The overall theme is brighter and more color-saturated, using blue, cyan, purple, and red accents instead of a mostly-black/red palette.
- Homepage branding and copy describe **ZxStudio**, not "ZxCrates Wiki".
- The plugin count, homepage CTA, and sidebar project list are driven by `/api/projects`.

## Owner publishing
Public visitors can read the site. Publishing, uploads, and wiki editing remain protected by the Owner Studio flow.

## Run
```bash
npm install
npm start
```

## Public mode
This build is intentionally read-only from the website UI. There is no , Studio button, or public write interface. Content changes should be made by updating the source/project data directly.
