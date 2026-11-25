const repository = "https://github.com/coelho97sc/Nano_Assistant";
const version = "0.4.0-beta.3";

export const site = {
  name: "NANO",
  version,
  // Public creator identity, as provided by the creator (role text lives in the locale files).
  creator: {
    name: "Simão Coelho",
    handle: "coelho97sc",
  },
  repository,
  /**
   * Google Search Console "HTML tag" code (only the content="…" value), or
   * set GOOGLE_SITE_VERIFICATION on Vercel. Set 2026-11-23 from Simão's
   * Search Console property; see docs/GOOGLE.md.
   */
  googleVerification:
    process.env.GOOGLE_SITE_VERIFICATION ||
    "nc3v6XNnBadFG0lIoe0WIL64VZ51JPsFJQqxSNTNBuU",
  /** Public profiles of the creator, for search engines (same as his site). */
  profiles: [
    "https://github.com/coelho97sc",
    "https://x.com/SimoCoelho27618",
    "https://simao-site.vercel.app",
  ],
  release: `${repository}/releases/tag/v${version}`,
  checksum: `${repository}/releases/download/v${version}/SHA256SUMS.txt`,
  installer: `Nano-Setup-${version}-x64.exe`,
  // Direct link to the installer asset of the official release.
  installerUrl: `${repository}/releases/download/v${version}/Nano-Setup-${version}-x64.exe`,
  apk: `NANO-Android-${version}.apk`,
  // Direct link to the Android app (test-signed APK) of the same release.
  apkUrl: `${repository}/releases/download/v${version}/NANO-Android-${version}.apk`,
  links: {
    privacy: `${repository}/blob/main/PRIVACY.md`,
    security: `${repository}/blob/main/SECURITY.md`,
    changelog: `${repository}/blob/main/CHANGELOG.md`,
    docs: `${repository}/blob/main/docs/README.md`,
    guide: `${repository}/blob/main/docs/BETA_GUIDE.md`,
    support: `${repository}/blob/main/SUPPORT.md`,
    license: `${repository}/blob/main/LICENSE`,
    checklist: `${repository}/blob/main/docs/PUBLIC_RELEASE_CHECKLIST.md`,
    phoneGuide: `${repository}/blob/main/docs/TESTAR_NO_TELEMOVEL.md`,
    releaseNotes: `${repository}/blob/main/docs/RELEASE_NOTES_${version}.md`,
  },
} as const;
