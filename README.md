# ADA Auditor  Free WCAG 2.2 AAA Checker

Paste a URL or HTML source. Get 43 static findings for WCAG 2.2 A, AA and AAA with plain-language fixes.

Live demo: https://indigenousj.github.io/ADA/ (enable Pages on `main` / root)

## Use it
1. Open the page.
2. Paste HTML (or Fetch URL; if blocked by CORS, View Source with Ctrl+U and paste).
3. Choose Run audit. Filter by Level / Severity, then Apply filters.
4. Copy report or Download .md.

## What it checks

Skip link, h1 + heading order, lang, title, alt text, button names, decorative icons, labels, contenteditable role, div-as-button, table scope + caption, close names, aria-current, new-tab warnings, link purpose (AAA), contrast 7:1 (manual), focus indicator, 44px targets, reduced motion, abbreviations, reading level, help availability, no timing - plus links have names (4.1.2), form labels (3.3.2), no positive tabindex (2.4.3), no meta refresh (2.2.1), frame titles (4.1.2), SVG named or hidden (1.1.1), empty headings (1.3.1), unique ids (1.3.1), one main landmark (1.3.1), list items in lists (1.3.1), valid ARIA roles (4.1.2), no autoplay sound (1.4.2), video captions (1.2.2), autocomplete on email/tel (1.3.5), no focusable content inside aria-hidden (1.3.1).


## Design notes
This page itself is built to meet WCAG 2.2 AAA: 7:1 text contrast, 44px targets,
3px focus outline, no time limits, confirm + undo on Clear, Apply-filters
(no surprise changes), glossary with plain language, high-contrast theme.

Static checks only ΓÇö always confirm with axe DevTools, keyboard-only pass,
400% zoom / 320px width, and NVDA + JAWS + VoiceOver.

## Run locally
Just open `index.html` in a browser. No build, no server. Bootstrap via CDN.

## License
MIT ΓÇö see LICENSE (add one if distributing).

