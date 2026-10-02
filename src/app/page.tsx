import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { Product } from "@/components/product";
import { Brain } from "@/components/brain";
import { Modes } from "@/components/modes";
import { Capabilities } from "@/components/capabilities";
import { Privacy } from "@/components/privacy";
import { Story } from "@/components/story";
import { Development } from "@/components/development";
import { Download } from "@/components/download";
import { Footer } from "@/components/footer";
import { site } from "@/content/site";
import { ScrollMotion } from "@/components/scroll-motion";
import { CinemaLoader } from "@/components/cinema/loader";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NANO",
    description: site.description,
    operatingSystem: "Windows 10, Windows 11 (x64)",
    applicationCategory: "ProductivityApplication",
    softwareVersion: site.version,
    downloadUrl: site.release,
    softwareHelp: site.links.guide,
    isAccessibleForFree: true,
  };
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Saltar para o conteúdo
      </a>
      <div id="top" />
      <Navigation />
      <ScrollMotion />
      <CinemaLoader />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Product />
        <Modes />
        <Brain />
        <Capabilities />
        <Privacy />
        <Story />
        <Development />
        <Download />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
