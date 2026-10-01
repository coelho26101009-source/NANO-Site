import Image from "next/image";
import { site } from "@/content/site";
import { DownloadLink, Eyebrow, TextLink } from "./ui";
import imageAssets from "@/content/images.json";

export function Download() {
  return (
    <section
      id="download"
      tabIndex={-1}
      className="section download-section"
      aria-labelledby="download-heading"
    >
      <div className="container">
        <div className="download-main">
          <Image
            src={imageAssets["/brand/nano-symbol.png"].variants[0].src}
            alt=""
            width={100}
            height={81}
            unoptimized
          />
          <Eyebrow>O próximo passo é teu</Eyebrow>
          <h2 id="download-heading">Dá espaço ao NANO.</h2>
          <p className="download-tagline">
            O teu assistente pessoal, no teu Windows.
          </p>
          <DownloadLink href={site.release}>Descarregar NANO</DownloadLink>
          <div className="download-meta">
            <span>NANO {site.version}</span>
            <span>Beta pública</span>
            <span>Windows 10/11 x64</span>
          </div>
          <p className="download-destination">
            Abre a página oficial da release no GitHub.
          </p>
        </div>
        <div className="download-notice">
          <div>
            <span className="notice-label">ANTES DE INSTALAR</span>
            <h3>Uma Beta, com transparência.</h3>
            <p>
              O instalador ainda não está assinado. O Windows pode mostrar um
              aviso de editor desconhecido ou do SmartScreen. Confirma a origem
              e o checksum.{" "}
              <strong>Não desatives a segurança do Windows.</strong>
            </p>
            <p>
              As atualizações são manuais. A instalação num Windows totalmente
              limpo ainda não foi validada nesta release. Guarda cópias dos
              dados importantes e lê as notas antes de instalar.
            </p>
          </div>
          <div className="download-check">
            <span className="small-label">VERIFICA A DESCARGA</span>
            <a className="checksum-link" href={site.checksum}>
              SHA256SUMS.txt<span aria-hidden="true">↗</span>
            </a>
            <p>
              Compara o valor do ficheiro com o resultado deste comando no
              PowerShell, na pasta da descarga:
            </p>
            <code>Get-FileHash .\{site.installer} -Algorithm SHA256</code>
            <TextLink href={site.links.guide}>
              Guia da primeira execução
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
