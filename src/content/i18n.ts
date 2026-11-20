import { en, type Copy } from "./locales/en";
import { pt } from "./locales/pt";

export type Locale = "en" | "pt";
export type { Copy };
export const copy: Record<Locale, Copy> = { en, pt };

/** localStorage key that remembers an explicit language choice. */
export const LANGUAGE_STORAGE_KEY = "nano-lang";

/**
 * Runs in <head> of the English page (`/`) before first paint. A visitor whose
 * browser prefers Portuguese goes to `/pt`, unless they chose a language
 * before. `?lang=en` (the link from the Portuguese page) records the choice
 * and is removed from the address bar. Crawlers and visitors without
 * JavaScript always get the page they asked for.
 */
export const languageBootScript = `(function(){try{var k=${JSON.stringify(LANGUAGE_STORAGE_KEY)},s=localStorage,m=/[?&]lang=(en|pt)\\b/.exec(location.search);if(m){s.setItem(k,m[1]);var q=location.search.replace(/([?&])lang=(en|pt)\\b&?/,"$1").replace(/[?&]$/,"");history.replaceState(null,"",location.pathname+q+location.hash);if(m[1]==="en")return}var c=s.getItem(k);if(c==="en")return;var l=(navigator.languages&&navigator.languages[0])||navigator.language||"";if(c==="pt"||/^pt\\b/i.test(l))location.replace("/pt"+location.search+location.hash)}catch(e){}})()`;

/**
 * Runs in <head> of the Portuguese page (`/pt`). `?lang=pt` (the link from the
 * English page) records the choice, so a visitor who switched back to
 * Portuguese is not kept on English by an older "en" choice the next time they
 * open `/`. The parameter is removed from the address bar.
 */
export const portugueseChoiceScript = `(function(){try{if(/[?&]lang=pt\\b/.test(location.search)){localStorage.setItem(${JSON.stringify(LANGUAGE_STORAGE_KEY)},"pt");var q=location.search.replace(/([?&])lang=pt\\b&?/,"$1").replace(/[?&]$/,"");history.replaceState(null,"",location.pathname+q+location.hash)}}catch(e){}})()`;
