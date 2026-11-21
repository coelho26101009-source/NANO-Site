const repository = "https://github.com/coelho26101009-source/Nano_Assistant";
const version = "0.4.0-beta.1";

export const site = {
  name: "NANO",
  version,
  // Public creator identity, as provided by the creator (role text lives in the locale files).
  creator: {
    name: "Simão Coelho",
    handle: "coelho26101009-source",
  },
  repository,
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
