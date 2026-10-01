# NANO website — design plan

## Direction

Charcoal canvas, warm white type, restrained ice-blue accents. An editorial product page with generous space and fine dividers, rather than a wall of cards. Use only the corrected official N symbol and actual public application screenshots. No generated imagery, WebGL, video or animation dependency.

## Page sequence

1. Floating navigation; compact, keyboard-accessible mobile disclosure.
2. Split hero: confident Portuguese headline, release/download actions, dimensional official symbol. Small pointer response on fine pointers only.
3. Product introduction and interactive four-view screenshot showcase: Home, Thinking, Conversation, voice overlay.
4. Brain: real three-node graph screenshot, explanatory notes about active memories and their actual relationships.
5. LOCAL / AUTO / CLOUD: three editorial columns with local highlighted, explicit routing and voice/network caveats.
6. Capabilities: numbered rows for conversation, Windows interaction and optional voice.
7. Privacy/security: clear data flows, scoped permissions, encrypted credentials, links to original documentation.
8. Creator: public repository handle in one configuration field, personal project story; no private biographical details.
9. Open development and Beta: current capabilities versus documented pending work, no dates or invented roadmap commitments.
10. Download: official release, checksum instructions, unsigned installer, manual updates and clean-Windows validation limitation.
11. Minimal footer with source/support links.

## Implementation

Next.js App Router, TypeScript, React, ordinary CSS. Static server-rendered sections with small client islands for navigation, tabs and pointer motion. Content and release constants separate. Local assets with Next Image, self-hosted font via Next Font. Reduced-motion and no-JavaScript defaults remain complete.

## Verification

Lint, typecheck, production build; Chromium at 1920/1440/1280/768/390/360 widths. Screenshot hero/full page/mobile/Brain/download, inspect images; test all tabs, mobile disclosure, Escape/focus, reduced motion, links, overflow and browser errors. Verify preview before any production deployment.
