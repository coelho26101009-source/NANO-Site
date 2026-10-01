# Validação — implementação inicial

Revisão de 2026-10-01, em Chromium real sobre a build de produção local.

## Resultado

- `npm run lint`: passou, sem avisos.
- `npm run typecheck`: passou.
- `npm run build`: passou; página e rotas de metadados pré-renderizadas.
- `npm run verify`: 39 verificações passaram.
- `npm audit --audit-level=high`: 0 vulnerabilidades reportadas.
- Larguras 1920, 1440, 1280, 1024, 768, 390 e 360 px: sem overflow horizontal.
- axe WCAG A/AA e 2.1 A/AA em 1440 e 390 px: 0 violações detetadas. Isto não substitui uma auditoria humana completa com tecnologias de apoio.
- Sem erros de consola ou exceções não tratadas no browser.
- Links externos do repositório, release, checksum e documentação: HTTP 200.
- Testados menu por teclado, Escape e restauro de foco, skip link, navegação dos separadores com setas/Home/End, disclosure de privacidade e links internos.
- Modo de movimento reduzido desativa parallax, animações e scroll suave.
- Sem JavaScript, conteúdo, download e menu móvel continuam disponíveis; a galeria mantém a primeira captura e uma ligação às restantes no repositório.

## Capturas locais

`npm run verify` cria estas evidências em `artifacts/`, deliberadamente fora do Git:

- `desktop-hero.png` (1440 px), `desktop-full.png`.
- `mobile-hero.png` (390 px), `mobile-full.png`.
- `desktop-product.png`, `mobile-product.png`.
- `desktop-brain.png`, `mobile-brain.png`.
- `desktop-modes.png`, `mobile-modes.png`.
- `desktop-download.png`, `mobile-download.png`.
- `showcase-home.png`, `showcase-thinking.png`, `showcase-conversation.png`, `showcase-voice.png`.
- `mobile-menu.png`, `social.png` e `verification.json`.

Foram ainda revistas capturas do hero a 768 e 1920 px. As capturas de secções isoladas ocultam apenas a navegação fixa para evitar que esta sobreponha a secção durante a captura. As páginas completas preservam a navegação. As capturas principais usam movimento reduzido para estabilizar a imagem; o comportamento de movimento normal também foi testado.

## Desempenho

Página estática, três ilhas de interação (menu, símbolo e galeria), sem biblioteca de animações, sem vídeo, WebGL, analytics ou chamadas a APIs no browser. Imagens locais com dimensões e `sizes`, preload do N principal, lazy loading abaixo da dobra, fonte servida localmente.

Na medição local de laboratório: aproximadamente 209 kB transferidos no carregamento inicial, CLS 0, LCP 160 ms. É uma medição local sem limitação de rede, não uma previsão de Core Web Vitals em produção. Falta medir a preview num ambiente de rede real.

## Publicação

Configuração de Vercel preparada. Não foi criado qualquer deployment. O conector devolveu uma lista vazia de equipas e a chamada de deploy devolveu `Tool deploy_to_vercel not found`; não foram encontradas credenciais locais utilizáveis. É necessário associar uma conta/projeto Vercel, criar uma preview e revê-la antes de produção.

Sem URL de produção conhecida, não é inventado um domínio: canonical ausente, sitemap vazio e indexação desativada. `SITE_URL` ou `VERCEL_PROJECT_PRODUCTION_URL` ativa os metadados de produção; previews continuam sem indexação.

## Limites de conteúdo

O repositório público da aplicação continua a ser a fonte de verdade. As capturas oficiais ainda exibem uma versão interna anterior, o que é explicado na página. A captura do overlay tem estado simulado e está identificada como tal. O roadmap apresenta pontos documentados em aberto, sem prometer funcionalidades ou datas. Não foi usado nem é necessário um asset Higgsfield.
