# Public product sources

Checked 2026-10-01. Application main commit: `3f3524ea82812c337e71e4945b722ee8e099707b`.

All product claims are based on the public [Nano_Assistant repository](https://github.com/coelho26101009-source/Nano_Assistant), not private files in the application checkout.

- [README](https://github.com/coelho26101009-source/Nano_Assistant/blob/main/README.md): current UI, threads, memory/RAG/Brain, routing, voice and PC Control.
- [0.2.0-beta.1 release](https://github.com/coelho26101009-source/Nano_Assistant/releases/tag/v0.2.0-beta.1): canonical release, installer, unsigned/manual updates/clean-machine limitations.
- [Privacy](https://github.com/coelho26101009-source/Nano_Assistant/blob/main/PRIVACY.md): model routing, cloud context and tool results, attempted providers, Edge TTS, SQLite and DPAPI.
- [Security](https://github.com/coelho26101009-source/Nano_Assistant/blob/main/SECURITY.md): validation/policy/permission/execution boundaries, narrow tools and limitations.
- [Changelog](https://github.com/coelho26101009-source/Nano_Assistant/blob/main/CHANGELOG.md): corrected branding, 0.2 release, tests and improvements.
- [Beta guide](https://github.com/coelho26101009-source/Nano_Assistant/blob/main/docs/BETA_GUIDE.md): bundled runtime, separate Ollama/API setup, optional voice dependencies.
- [Release checklist](https://github.com/coelho26101009-source/Nano_Assistant/blob/main/docs/PUBLIC_RELEASE_CHECKLIST.md) and [releasing](https://github.com/coelho26101009-source/Nano_Assistant/blob/main/docs/RELEASING.md): pending validation and release maturity. No formal roadmap is present; site describes documented open work, not dated commitments.

## Source conflicts handled

Older search-engine cached README content is obsolete. Use the commit-pinned public raw files. Privacy and Security still contain isolated obsolete wording saying no release/artifact exists; the current release and Beta guide take precedence for release status. Public screenshots still display an older internal version: keep them unaltered and disclose this in their caption. Voice overlay listening state was simulated in Electron; do not imply a live microphone test.

## Assets

Copied from the above main commit into `public/brand` and `public/screenshots`. The corrected derived `nano-symbol.png` is from commit `c767e442eb236a4529365eb7495b154f664c58e8` (Fix NANO symbol asset artifacts). No tracing or redrawing. Only this derivative is used for the site symbol. Official wordmark is used in navigation/footer. Icons and social composition derive from the same public symbol.

Screenshots: `nano-home.png`, `nano-thinking.png`, `nano-conversation.png`, `nano-brain.png`, `nano-overlay.png`. These are official demonstration-profile captures, not fabricated interfaces. The Brain has three demonstration nodes and two real relationships. All core assets are served locally.

The image-quality pass adds responsive lossless WebP encodings of these same files in `public/images/`. Original PNGs remain unchanged, including the corrected symbol's alpha. See [image quality review](IMAGE_QUALITY.md) for source dimensions, compression comparisons, responsive sizing and native pixel/alpha verification.

Creator display field uses the intentionally public repository owner handle `coelho26101009-source`; no personal name was available from public account branding.
