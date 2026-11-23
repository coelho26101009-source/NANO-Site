# Pôr o site do NANO no Google (passos simples)

O site já está pronto para o Google: título, descrição, ícone quadrado, mapa do site
(`/sitemap.xml`) e "dados estruturados" que dizem ao Google que o site se chama **NANO**
e que é uma app grátis para Windows. Falta só **avisar o Google que o site existe**.
Isso só tu podes fazer, porque é com a tua conta Google. Demora uns 5 minutos.

## 1. Google Search Console (o mais importante)

1. Abre <https://search.google.com/search-console> e entra com a tua conta Google.
2. Clica em **Adicionar propriedade**.
3. Escolhe a caixa da direita, **Prefixo do URL**, e escreve:
   `https://nanoassistantsite.vercel.app/`  → **Continuar**.
4. Na lista de métodos de verificação, abre **Etiqueta HTML** (HTML tag).
   Aparece uma linha assim:
   `<meta name="google-site-verification" content="ABC123...xyz" />`
5. **Copia só o código que está dentro de `content="..."`** e manda-mo aqui no chat.
   (Não é segredo nenhum, é público.)
6. Eu ponho o código no site. Quando eu disser que está publicado (1 a 2 minutos),
   volta ao Search Console e carrega em **Verificar**.
7. Já verificado, no menu da esquerda vai a **Sitemaps**, escreve `sitemap.xml`
   e carrega em **Enviar**.
8. Por fim, vai a **Inspeção de URL** (barra de cima), cola
   `https://nanoassistantsite.vercel.app/` e carrega em **Pedir indexação**.
   Faz o mesmo para `https://nanoassistantsite.vercel.app/pt`.

## 2. Bing (opcional, 1 clique)

O Bing também alimenta o DuckDuckGo, o Yahoo e a pesquisa do ChatGPT.
Abre <https://www.bing.com/webmasters>, entra, e escolhe **Importar do Google Search Console**.
Pronto, não precisas de fazer mais nada.

## O que esperar

- O Google demora **alguns dias a 2 semanas** a mostrar o site.
- Pesquisar só **"nano"** é muito difícil: é uma palavra que o mundo inteiro usa
  (o editor nano, a moeda Nano, o iPod nano...). No início o site vai aparecer em
  pesquisas como **"NANO assistant"**, **"NANO assistente IA"** ou **"NANO Simão Coelho"**.
- O que mais ajuda a subir: **links para o site** noutros sítios. Já tens o teu site
  pessoal a apontar para ele. Ajuda pôr o link também no **README do GitHub**
  (no topo, "Website"), na **bio do X** e no campo **Website** do repositório
  no GitHub (engrenagem ao lado de "About").
