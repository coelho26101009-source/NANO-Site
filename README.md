# NANO — website oficial

Website em português de Portugal para o NANO, assistente pessoal de IA para Windows. O site e a aplicação têm repositórios separados. Este projeto não altera nem importa código privado da aplicação.

## Desenvolvimento

Node.js 24 recomendado (mínimo 22.12).

```sh
npm ci
npm run dev
```

## Verificação

```sh
npm run lint
npm run typecheck
npm run build
npm run start
```

Noutro terminal, instala o Chromium de teste dentro deste workspace e executa a revisão:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.cache/browsers'
npx playwright install chromium
npm run verify
```

Em Linux/macOS: `PLAYWRIGHT_BROWSERS_PATH=.cache/browsers npx playwright install chromium`.

`npm run verify` testa a build servida em `http://127.0.0.1:3000`, grava capturas e resultados em `artifacts/` (ignorado pelo Git), verifica sete larguras de ecrã, teclado, menu, tabs, ausência de JavaScript, movimento reduzido, metadados, links e acessibilidade com axe. `VERIFY_URL` permite apontar para uma preview. `VERIFY_EXTERNAL_LINKS=0` omite pedidos externos; o CI usa esta opção para não depender do GitHub durante os testes.

## Organização

- `src/app`: página, layout, estilos e rotas de metadados.
- `src/components`: secções e pequenas ilhas interativas.
- `src/content/site.ts`: versão, URLs oficiais, criador público e dados de conteúdo.
- `src/lib/metadata.ts`: URL de produção e regras de indexação.
- `public/brand`, `public/screenshots`: assets oficiais copiados do repositório público.
- `docs/SOURCES.md`: proveniência e limitações das fontes.
- `docs/DESIGN.md`: plano de composição.
- `scripts/verify.mjs`: revisão reproduzível em Chromium.

## Atualizar uma release

Altera `version` em `src/content/site.ts`, confirma o nome do instalador e a presença do `SHA256SUMS.txt` na release oficial. Revê as limitações na secção Download e as fontes públicas antes de publicar. `site.creator` é o único campo do nome/handle público do criador.

## Vercel

Importa `coelho26101009-source/NANO-Site`, com **Root Directory = raiz do repositório**, framework Next.js, `npm ci` e `npm run build`. Não apontes para o repositório da aplicação. Não é preciso backend, base de dados, chave de API ou domínio comprado.

Cria e verifica primeiro uma preview. Só depois promove para produção. Após existir uma URL de produção real, define `SITE_URL` para essa URL (sem caminho), ou usa a variável automática `VERCEL_PROJECT_PRODUCTION_URL`. `VERCEL_ENV=preview` impede a indexação das previews. Sem URL de produção, o site não inventa um domínio: não emite canonical, mantém o sitemap vazio e pede aos motores de busca que não indexem. A imagem social local usa localhost apenas durante o desenvolvimento; em Vercel usa o URL real do deployment.

Não guardar credenciais no repositório. Todos os `.env*`, `.vercel`, caches e artefactos locais são ignorados. A configuração da conta Vercel e a escolha da URL final continuam a ser necessárias antes da publicação.

## Decisões

Next.js 16.3.8 e React 19.3.0, CSS sem biblioteca de animação, fonte Manrope servida localmente pelo Next Font, imagens locais otimizadas pelo Next Image, conteúdo estático. TypeScript 6.0.3 e ESLint 9.39.5 estão fixados nas versões compatíveis com os peers de `eslint-config-next`; atualizar em conjunto quando o ecossistema suportar os novos majors. Nenhum dado analítico é recolhido pelo site e não há scripts de terceiros no browser.

Não foi usado Higgsfield. A marca existente e as capturas reais dão à página o carácter necessário; não é recomendado um asset gerado para esta versão.
