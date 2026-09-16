# ADA Auditor — Free WCAG 2.2 AAA Checker

Paste a URL or HTML source. Get 25 static findings for WCAG 2.2 A, AA and AAA with plain-language fixes.

Live demo: https://indigenousj.github.io/ADA/ (enable Pages on `main` / root)

## Use it
1. Open the page.
2. Paste HTML (or Fetch URL; if blocked by CORS, View Source with Ctrl+U and paste).
3. Choose Run audit. Filter by Level / Severity, then Apply filters.
4. Copy report or Download .md.

## What it checks
Skip link, h1 + heading order, lang, title, alt text, button names, decorative icons,
labels, contenteditable role, div-as-button, table scope + caption, close names,
aria-current, new-tab warnings, link purpose (AAA), contrast 7:1 (manual),
focus indicator, 44px targets, reduced motion, abbreviations, reading level,
help availability, no timing.

## Design notes
This page itself is built to meet WCAG 2.2 AAA: 7:1 text contrast, 44px targets,
3px focus outline, no time limits, confirm + undo on Clear, Apply-filters
(no surprise changes), glossary with plain language, high-contrast theme.

Static checks only — always confirm with axe DevTools, keyboard-only pass,
400% zoom / 320px width, and NVDA + JAWS + VoiceOver.

## Run locally
Just open `index.html` in a browser. No build, no server. Bootstrap via CDN.

## License
MIT — see LICENSE (add one if distributing).

