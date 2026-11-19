import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { Product } from "@/components/product";
import { Brain } from "@/components/brain";
import { Modes } from "@/components/modes";
import { Capabilities } from "@/components/capabilities";
import { Privacy } from "@/components/privacy";
import { Story } from "@/components/story";
import { Development } from "@/components/development";
import { Faq } from "@/components/faq";
import { Download } from "@/components/download";
import { Footer } from "@/components/footer";
import { WhatsNew } from "@/components/whats-new";
import { Phone } from "@/components/phone";
import { site } from "@/content/site";
import { copy, type Locale } from "@/content/i18n";
import { ScrollMotion } from "@/components/scroll-motion";
import { CinemaLoader } from "@/components/cinema/loader";

export function HomePage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "NANO",
      description: t.meta.description,
      inLanguage: t.htmlLang,
      operatingSystem: "Windows 10, Windows 11 (x64), Android 7+",
      applicationCategory: "ProductivityApplication",
      softwareVersion: site.version,
      downloadUrl: site.installerUrl,
      releaseNotes: site.release,
      softwareHelp: site.links.guide,
      license: site.links.license,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      author: {
        "@type": "Person",
        name: site.creator.name,
        url: `https://github.com/${site.creator.handle}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: t.htmlLang,
      mainEntity: t.faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
  return (
    <>
      <a className="skip-link" href="#content">
        {t.skip}
      </a>
      <div id="top" />
      <Navigation t={t.nav} language={t.language} />
      <ScrollMotion />
      <CinemaLoader />
      <main id="content" tabIndex={-1}>
        <Hero t={t} />
        <Product t={t} />
        <Modes t={t} />
        <Brain t={t} />
        <Capabilities t={t} />
        <WhatsNew t={t} />
        <Phone t={t} />
        <Privacy t={t} />
        <Story t={t} />
        <Development t={t} />
        <Faq t={t} />
        <Download t={t} />
      </main>
      <Footer t={t} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
