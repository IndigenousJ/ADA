# Project Prompt — ADA Auditor (WCAG 2.2 AAA Checker)

Paste this into an AI coding agent to brief it on this project.

## What this is
A free, single-page, **static** browser tool that audits pasted HTML (or a fetched URL) against
**40 static WCAG 2.2 A/AA/AAA checks** and reports findings with plain-language fixes.
Runs 100% client-side: no backend, no signup, no data leaves the page.

- Repo: https://github.com/IndigenousJ/ADA  (branch `main`)
- Live: https://indigenousj.github.io/ADA/  (GitHub Pages, served from `main` / root)
- Raw:  https://raw.githubusercontent.com/IndigenousJ/ADA/main/

## Stack & constraints (do not change without asking)
- Pure static files. **No build step, no npm/Node, no bundler, no framework.**
- Bootstrap **5.3.3** CSS + Bootstrap Icons **1.11.3**, loaded from jsDelivr CDN.
- Vanilla ES5-style JavaScript: IIFE + `'use strict'`, `var`, `$ = getElementById` helper.
- Must work by opening `index.html` straight from disk.

## File layout
- `index.html` — the whole UI (head meta/OG/Twitter, JSON-LD, header, input, results, share,
  glossary, modals). CSS/JS are kept minified on single lines — preserve that style.
- `assets/css/app.css` — custom overrides on top of Bootstrap; defines
  `--focus:#0b3d91`, `--ink:#0a1930`, `--link:#0b3d91`.
- `assets/js/app.js` — `audit()` engine, tab logic, filters, report copy/download,
  confirm modal, share-link copy.
- `README.md` — user docs.

## Accessibility rules for THIS page (non-negotiable)
The page itself must meet **WCAG 2.2 AAA**:
- Text contrast ≥ **7:1**; interactive targets ≥ **44×44 px**.
- Visible **3px `#0b3d91` focus outline** via `:focus-visible`.
- Never convey meaning by color alone; keep the skip link to `#main`.
- Plain language; `<abbr>` for jargon; label every control; `aria-*` on custom widgets.
- Respect `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`.

## Hard "do not" list
- **No ads, analytics, or trackers.** Google AdSense was removed and `ads.txt` deleted — do not re-add.
- No third-party scripts beyond the Bootstrap / Bootstrap Icons CDNs.
- No build step or dependencies.
- Do not remove the skip link, the 44px targets, or the focus ring.
- Do not reformat the minified one-line CSS/JS.

## Current state (as of last work)
- Header donate button: `<a class="btn btn-paypal btn-lg d-inline-flex align-items-center gap-2 mt-2"
  style="color:#fff!important;text-decoration:none!important" href="https://www.paypal.com/ncp/payment/CG4CG4PPREUG8"
  title="…">` — **white text, no underline, opens in the same tab** (no `target="_blank"`).
- `.btn-paypal` = PayPal blue `#0070ba`, hover `#014c8c`, white text/icon.
- The header **"Appearance" theme dropdown was removed**; `app.js` guards `$("themeSelect")`
  with a null check. The `[data-theme]` CSS still exists (harmless).
- `#htmlInput` textarea has `autofocus` (so the skip link is not the first Tab stop).
- AdSense is fully gone from `index.html`, `README.md`, and `ads.txt`.

## How to change & verify
1. Edit the static files; keep the minified one-line style and AAA compliance.
2. Commit with a short conventional message (`feat: …`, `fix: …`, `docs: …`).
3. Push to `origin main`.
4. Verify against **raw `main`** and the **live Pages URL** (allow 1–2 min for the Pages rebuild):
   - `curl.exe -s https://raw.githubusercontent.com/IndigenousJ/ADA/main/index.html`
   - Ad check must return **0** matches for `adsbygoogle|google-adsense-account|pagead2|ca-pub-863|hAds`.

## Gotchas learned the hard way
- `app.css` line ~7: `a{…text-decoration:underline!important}` underlines **all** links —
  override per component; inline `!important` is the bulletproof option.
- `a:visited{color:#4a1d96!important}` (specificity 0,1,1) beats `.btn-paypal` (0,1,0) —
  hence the button's inline `color:#fff!important`.
- `header a{color:var(--link)!important}` also competes; scope rules with `header a.btn-paypal`.
- Bootstrap Icons 1.11.3 **does** ship `bi-paypal` (glyph `\f662`) — no inline brand SVG needed.
- Removing a `<select>` breaks unguarded JS listeners — always null-guard `getElementById` results.
- `git revert` of the AdSense + footer commits conflicts at the share-paragraph — prefer surgical edits.
