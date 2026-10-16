# Sina Mahboobipour — Personal Portfolio

A responsive academic and engineering portfolio built with semantic HTML, CSS, and vanilla JavaScript. It has no application dependencies, bundler, backend, or installation step and can be hosted on GitHub Pages.

## Local preview

Open `index.html` directly, or run the optional preview server with Node.js:

```sh
node serve.mjs
```

Visit `http://127.0.0.1:4173/`. Set the `PORT` environment variable to use another port. The server binds only to localhost and is for development; GitHub Pages serves the static files directly.

## Architecture

- `index.html`: content, navigation, accessible inline diagrams, metadata, and structured data.
- `styles.css`: design tokens, responsive layouts, light and dark themes, reduced-motion support, and print styles.
- `interface.css`: typographic masthead, contact area, footer navigation, and interactive figure styling.
- `script.js`: theme persistence, native modal navigation, active-section indication, email copying, printing, and origin-aware metadata.
- `simulation.js`: the interactive multi-cloud model, request and response animation, node failure and recovery, and pause/reset controls.
- `favicon.svg`: the personal monogram.
- `social-preview.svg`: editable source for the 1200 × 630 social image.
- `social-preview.png`: the sharing image generated from that SVG; no image library is required to run the site.
- `serve.mjs`: an optional, dependency-free local preview server.

All content is visible without JavaScript. Mobile navigation falls back to ordinary header links. The enhanced menu uses a native dialog for focus containment, Escape support, and background isolation. Theme storage and clipboard failures do not prevent the site from working. Email links remain usable without clipboard access.

## Content and customization

Edit professional information directly in `index.html`. The academic details and project descriptions come from the supplied original website; the redesign does not add professional appointments, publications, project outcomes, or proficiency claims. The fault-tolerance work is labeled a research study rather than a published paper. Diagrams are conceptual, not experimental results or an implementation specification.

The original site did not include a CV, project repositories, paper URLs, or a confirmed publication status. Project actions therefore open email discussions. Replace them with verified public artifacts when available. The print action produces an academic profile from the webpage; it is not presented as a separate CV.

Change the CSS custom properties at the beginning of `styles.css` to adjust colors and fonts. Instrument Serif and DM Sans are requested from Google Fonts with `display=swap`, with local fallbacks. The site remains readable when those fonts are blocked or unavailable.

Both light and dark modes support keyboard focus styling and reduced motion. A saved theme takes precedence over the operating-system preference.

## Interactive Figure 1

The figure is a client-side simulation, not live infrastructure telemetry or a report of project results. Three cloud buttons toggle node availability. Requests and responses move through a coordinator; taking a node offline reroutes traffic through the remaining nodes. Taking all nodes offline stops routing, and restoring a node makes a route available again.

Pause freezes the packet positions while leaving node controls usable. Reset restores all nodes and the initial routing state. Native buttons support pointer, touch, and keyboard operation, and a polite status message describes user-triggered changes. Reduced-motion preferences start the model paused; users may explicitly choose Play. Animation stops outside the viewport, while the page is hidden, and during printing. The unenhanced figure retains its static diagram and conceptual description.

## Metadata and deployment URL

The canonical link is relative to the directory containing the page, so it resolves correctly on an account site, project site, or custom domain. JavaScript resolves the Open Graph URL and social-image paths against the current origin. The supplied archive name and linked GitHub profile suggested different website addresses, so no unverified public domain has been hard-coded.

Before publishing, confirm the final public URL and replace the relative `og:image` and `twitter:image` content with the absolute URL of `social-preview.png`. Add a static `og:url` with that confirmed public URL for social crawlers that do not execute JavaScript. Update the canonical URL to the same absolute address if desired. Verify the social preview with the intended platform after publishing. Regenerate the PNG after editing its SVG source.

## Verification

JavaScript syntax can be checked without installing anything:

```sh
node --check script.js
node --check simulation.js
node --check serve.mjs
```

The site has no framework build, lint configuration, or test-runner dependency. Use browser tools to inspect desktop, tablet, and mobile layouts, keyboard navigation, menu focus containment and restoration, theme persistence, copy-email feedback, and the print stylesheet. Verify that all local resources return HTTP 200 and that every internal fragment targets an existing ID. Browser checks and their observed results are reported separately; print output and real-world Core Web Vitals require their own verification.

Checks performed during the redesign:

- JavaScript and inline-script syntax, structured-data JSON, HTML tag nesting, unique IDs, internal targets, and local file references passed.
- The page, stylesheet, script, favicon, and social image returned HTTP 200 with their expected content types. An unknown asset returned HTTP 404.
- Nine responsive viewport checks spanning 320–1440 px found no page overflow; the header and figure controls fit, the contact email remained within its container, and narrow mobile projects occupied the full content width.
- Menu focus wrapping in both directions, Escape, focus restoration, section navigation, and closing the menu when switching to desktop passed in the in-app browser.
- Theme persistence across reload and copy-email success feedback passed. Browser diagnostics contained no warnings or errors in the checked session.
- Calculated contrast for 159 visible text-bearing HTML elements per theme found no failures against the applicable text thresholds. This is a focused contrast check, not a complete accessibility certification.
- Figure 1 was verified for moving packets, pause and resume state, failed-node exclusion, all-node outage, single-node recovery, keyboard toggling, reset, and suspension outside the viewport.

Desktop and mobile rendering were visually inspected. Print styles and reduced-motion rules are included, but print pagination, operating-system reduced-motion emulation, and field Core Web Vitals were not tested.

## GitHub Pages

The publishing root must contain `index.html`, `styles.css`, `interface.css`, `script.js`, `simulation.js`, `favicon.svg`, and `social-preview.png` together. This supplied workspace has an additional outer directory; publish the contents of this directory rather than the outer archive wrapper. Relative asset and fragment URLs support both account and project sites.

Use the repository's existing GitHub Pages publishing configuration. For branch publishing, place the files in the configured repository root or `/docs` folder; an Actions workflow can instead upload this directory as its static artifact. No workflow or remote settings are assumed or changed by this redesign. `serve.mjs`, the SVG social-image source, and this README are not needed by the hosted page.

Changes are local until explicitly committed, pushed, and published by the owner.
