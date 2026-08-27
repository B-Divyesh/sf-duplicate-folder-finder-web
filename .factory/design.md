# Visual thesis — Mirrorbyte console

## Direction and rationale

Folder reconciliation is abstract, anxious work: thousands of nearly identical names and one irreversible mistake. Mirrorbyte uses a **pixel/demoscene language** to make the invisible comparison legible. Two block-built directory towers face each other across a cyan scan beam; status panels borrow the precision and economy of an old file utility, while modern spacing and plain language keep it calm. Decoration is explanatory: blocks represent nested directories, the beam represents local comparison, and amber pixels identify unresolved differences.

This is intentionally a single dark mode. Long-running scans benefit from low luminance, the cyan/amber semantic lights read crisply on ink navy, and it avoids an ornamental theme switch competing with the safety workflow.

## Tokens

- `ink-950 #071012`: page background; near-black green-blue from a CRT at rest.
- `ink-900 #0d1a1c`: primary surface.
- `ink-800 #14272a`: raised surface and rules.
- `paper #f2f6e8`: primary text, warm rather than clinical white; 16.7:1 on ink-950.
- `mist #a9bcb5`: secondary text; 9.1:1 on ink-950.
- `cyan #57f2d2`: primary action and scan state; 13.8:1 on ink-950.
- `cyan-deep #073e36`: dark action ink/surface.
- `amber #ffca58`: differences and cautions; 12.4:1 on ink-950.
- `red #ff7a78`: destructive/error state; 7.3:1 on ink-950.
- `green #82ee8f`: verified/identical state; 13.2:1 on ink-950.

Color never acts alone: every state includes an icon or word. Thin one-pixel rules, two-pixel offsets, and hard-edged shadows evoke a pixel raster without reducing readability.

## Type

- Display/labels: `"Courier New", ui-monospace, monospace`, uppercase sparingly, with tightened line height. This is system-hosted, fast, and authentically utility-like.
- Body: `Inter, ui-sans-serif, system-ui, sans-serif` where Inter is only used when locally available; the shipped system stack prevents network font requests. Body is 16px minimum, line height 1.55.
- Numeric counts use tabular figures. Scale: 14 / 16 / 20 / clamp(28–44) / clamp(40–64).

## Spacing and layout

The spacing rhythm is 4px-based: 4, 8, 12, 16, 24, 32, 48, 64. A 1180px centered shell uses a 12-column desktop grid. The compare dock overlaps the bottom of the hero only on wide screens; on phones, art becomes a short header strip and the two folder selectors stack in reading order. Touch targets are at least 44px. Dense result rows use generous 12–16px padding rather than tiny text.

## Interaction grammar

- Primary controls rise by a crisp 3px offset and depress to the surface when activated.
- Folder lanes are visibly numbered `A` and `B`; names remain beside every result so color memory is unnecessary.
- Scan progress travels from discovery → hashing → comparing with one plain-language status and determinate progress.
- Results open in place; filter tabs use `aria-pressed`, and tree/detail disclosure uses native buttons.
- The quarantine dialog names the exact folders, destination, and consequence; focus is trapped and restored.

## Motion policy

Functional transitions last 160–240ms and animate only opacity or transform. The scan beam makes one 1.8s pass only while work is active—never an idle loop. Results enter with a small upward continuity cue. Under `prefers-reduced-motion: reduce`, scrolling is instant, the beam becomes a static line, and all transitions/animations are removed.

## Original asset plan and provenance

Hero illustration: an original AI-generated, hard-edged pixel-art scene of two directory towers and a local scan bridge. It contains no interface promises beyond folder comparison. Responsive AVIF/WebP/fallback files are exported at fixed intrinsic dimensions. App icons and UI glyphs are hand-authored SVG/pixel CSS; no third-party icon set.

### Prompt sheet

Subject: two asymmetrical towers built from stacked file folders, facing each other across a narrow data bridge, small blocks aligned and misaligned to explain matching and differences. World/materials: 1990s demoscene pixel art, crisp one-pixel clusters, dark circuit-board ground, no texture noise. Light/lens: orthographic three-quarter view, cyan scan light from between towers, sparse amber mismatch lights, deep ink shadows. Palette words: ink navy, phosphor cyan, warm parchment, signal amber, verification green. Negative list: no people, no brands, no text, no letters, no numbers, no logos, no watermark, no photorealism, no smooth 3D gradients, no copyrighted characters.

Generation: Azure OpenAI image model via `/opt/fleet/lib/gen-image.sh`, `factory-image` deployment, 2026-08-27. The generated image is original for this product. Exact prompt and generation metadata are stored beside the source image in `assets/src/hero-directory-towers.json`. Generated imagery is disclosed in the site footer.
