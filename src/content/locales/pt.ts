import { site } from "../site";
import type { Copy } from "./en";

/** Portuguese (pt-PT) copy, served at `/pt`. Same shape as `en.ts`. */
export const pt: Copy = {
  locale: "pt",
  htmlLang: "pt-PT",
  ogLocale: "pt_PT",
  path: "/pt",
  meta: {
    title: "NANO — Assistente pessoal de IA para Windows",
    description:
      "O teu assistente pessoal de IA para Windows, gratuito e de código aberto. Conversa, memória e interação com o PC, com modelos locais ou cloud à tua escolha. Conhece a Beta pública do NANO.",
    ogEyebrow: "NANO · PARA WINDOWS",
    ogTitle: "O teu assistente pessoal.",
    ogTagline: "Local quando queres. Cloud quando precisas.",
    ogBeta: "Beta pública",
  },
  skip: "Saltar para o conteúdo",
  language: {
    label: "EN",
    name: "English",
    href: "/?lang=en",
    hrefLang: "en",
    aria: "View the site in English",
  },
  nav: {
    items: [
      { label: "Produto", href: "#product" },
      { label: "Brain", href: "#brain" },
      { label: "Privacidade", href: "#privacy" },
      { label: "FAQ", href: "#faq" },
      { label: "Sobre", href: "#about" },
    ],
    home: "NANO — início",
    main: "Navegação principal",
    mobile: "Navegação móvel",
    menu: "Menu de navegação",
    download: "Download",
    viewGithub: "Ver no GitHub",
  },
  hero: {
    badge: "Beta pública",
    eyebrow: "NANO · Assistente de IA para Windows",
    title: ["O teu assistente", "pessoal."],
    tagline: ["Local quando queres.", "Cloud quando precisas."],
    download: "Descarregar para Windows",
    github: "Ver no GitHub",
    meta: ["Gratuito e de código aberto", "Windows 10/11 x64"],
    discover: "Conhece o NANO",
    motto: "O teu computador. O teu contexto. A tua escolha.",
    artCaption: "Inteligência. Com presença.",
  },
  product: {
    eyebrow: "Feito para o teu dia a dia",
    title: ["Uma IA que vive", "contigo no teu PC."],
    intro:
      "Conversa, memória e interação com o Windows, no mesmo lugar. Escolhe entre modelos locais e cloud, retoma o teu contexto e usa a voz quando estiveres pronto.",
  },
  showcase: {
    tabs: "Explorar a aplicação",
    voiceEyebrow: "Uma presença discreta",
    voiceLead: "A conversa acompanha-te.",
    shortcutLabel: "Control mais Shift mais Espaço",
    voiceNote: [
      "Estado de escuta simulado na captura oficial.",
      "A voz é opcional e requer configuração adicional.",
    ],
    openCapture: "Abrir captura completa",
    assetNote:
      "Capturas oficiais num perfil de demonstração. Algumas mostram a versão interna anterior.",
    noscript: "As restantes capturas estão disponíveis no",
    noscriptLink: "repositório oficial",
  },
  experiences: [
    {
      id: "home",
      number: "01",
      label: "O teu espaço",
      name: "Home",
      title: "Uma conversa começa aqui.",
      description:
        "Um espaço tranquilo para pensar, perguntar e dar o próximo passo. Com as tuas conversas sempre à mão.",
      image: "/screenshots/nano-home.png",
      alt: "Ecrã inicial real do NANO: histórico à esquerda, símbolo N e campo para uma nova mensagem.",
      width: 1920,
      height: 1032,
    },
    {
      id: "thinking",
      number: "02",
      label: "A pensar contigo",
      name: "Thinking",
      title: "Acompanha o que está a acontecer.",
      description:
        "O estado do pedido e o modelo em utilização fazem parte da conversa. Nesta captura, o NANO está a processar um pedido local.",
      image: "/screenshots/nano-thinking.png",
      alt: "NANO a processar um pedido com o modelo local Ollama, num perfil de demonstração.",
      width: 1920,
      height: 1032,
    },
    {
      id: "conversation",
      number: "03",
      label: "Com contexto",
      name: "Conversation",
      title: "Retoma o fio à conversa.",
      description:
        "Volta a uma conversa anterior e continua de onde ficaste. O NANO reconstrói o contexto a partir das mensagens e do resumo dessa conversa.",
      image: "/screenshots/nano-conversation.png",
      alt: "Conversa real de demonstração no NANO, com a resposta do modelo local visível.",
      width: 1920,
      height: 1032,
    },
    {
      id: "voice",
      number: "04",
      label: "Para lá da janela",
      name: "Voice overlay",
      title: "Uma voz ao alcance de um atalho.",
      description:
        "Com a voz configurada, Ctrl + Shift + Space abre uma cápsula independente da janela principal. A transcrição local requer dependências opcionais.",
      image: "/screenshots/nano-overlay.png",
      alt: "Captura oficial da cápsula de voz NANO com o estado A ouvir simulado em Electron, sobre fundo claro.",
      width: 760,
      height: 180,
    },
  ],
  modes: {
    eyebrow: "Três modos. A tua escolha.",
    title: ["A inteligência muda.", "O controlo continua teu."],
    intro: [
      "Escolhe onde o NANO pensa. Com caminhos claros",
      "para o teu modelo local e para os teus provedores cloud.",
    ],
    path: "Percurso",
    items: [
      {
        id: "local",
        number: "01",
        title: "LOCAL",
        subtitle: "O teu PC. O teu modelo.",
        description:
          "Conversa com modelos locais através do Ollama. Os pedidos ao modelo ficam no teu computador, sem contactar provedores de IA cloud.",
        path: ["Tu", "Ollama", "Resposta"],
        footnote: "Requer Ollama e um modelo instalado à parte.",
        tag: "Inferência no dispositivo",
      },
      {
        id: "auto",
        number: "02",
        title: "AUTO",
        subtitle: "Continuidade, com critério.",
        description:
          "Começa pela tua cloud preferida. Se necessário, tenta outros provedores configurados e disponíveis, com o Ollama como último recurso.",
        path: ["Cloud preferida", "Alternativas", "Ollama"],
        footnote:
          "Respeita disponibilidade e limites. As tentativas ficam registadas.",
        tag: "Failover controlado",
      },
      {
        id: "cloud",
        number: "03",
        title: "CLOUD",
        subtitle: "A cloud que escolheste.",
        description:
          "Usa apenas o teu provedor cloud preferido para responder. Se estiver indisponível, o NANO informa-te: não troca de provedor nem recorre ao Ollama.",
        path: ["Tu", "Cloud escolhida", "Resposta"],
        footnote: "Groq, Mistral ou Google Gemini. Requer a tua chave de API.",
        tag: "Uma escolha explícita",
      },
    ],
    caveatStrong: "LOCAL refere-se ao modelo de linguagem.",
    caveat:
      "As respostas faladas enviam texto à Microsoft, mesmo em LOCAL. Pedidos de navegação web também usam a rede. Em AUTO, mais do que um provedor pode receber o pedido durante o failover.",
    caveatLink: "Ler mais sobre privacidade",
  },
  brain: {
    eyebrow: "NANO Brain",
    title: ["Uma memória", "que faz sentido."],
    intro: [
      "Há contexto que merece ficar.",
      "O NANO guarda memórias de longo prazo e recupera o que é relevante para a conversa.",
    ],
    more: "Conhecer o Brain",
    alt: "Grafo real do NANO Brain: O meu PC ligado a Ollama e Projeto NANO, com três nós de demonstração e duas relações.",
    openCapture: "Abrir a captura completa do NANO Brain",
    openCaptureShort: "Abrir captura completa",
    stored: "Contexto guardado localmente",
    stats: "3 nós de demonstração · 2 relações reais",
    details: [
      {
        label: "01 / GUARDAR",
        title: "O que escolhes lembrar.",
        text: "As memórias são extraídas localmente. Pedidos explícitos podem ficar ativos; inferências seguem regras de confiança.",
      },
      {
        label: "02 / RELACIONAR",
        title: "Ligações com origem.",
        text: "Os nós nascem de memórias ativas ou de uma ação tua. As relações surgem quando dois nós aparecem na mesma memória.",
      },
      {
        label: "03 / RECUPERAR",
        title: "Contexto, quando importa.",
        text: "A recuperação junta memórias relevantes e histórico da conversa. O Brain ainda está a amadurecer com o uso real.",
      },
    ],
    note: "Guardar localmente não impede o envio de contexto relevante ao modelo em AUTO ou CLOUD.",
    noteLink: "Ver como os dados são usados.",
  },
  capabilities: {
    eyebrow: "Para além da resposta",
    title: ["Uma conversa.", "Mais possibilidades."],
    intro:
      "Ferramentas concretas para o teu computador, ligadas ao contexto da conversa.",
    availability: "Disponível na Beta",
    items: [
      {
        number: "01",
        title: "Conversas que continuam.",
        label: "CHAT + HISTÓRICO",
        description:
          "Cria, pesquisa, retoma e organiza conversas. O histórico e a memória de longo prazo têm papéis distintos, para manter o contexto relevante.",
      },
      {
        number: "02",
        title: "Mais perto do Windows.",
        label: "PC CONTROL",
        description:
          "Abre aplicações, organiza janelas, ajusta o volume ou consulta o estado do PC. Ferramentas com âmbito definido e confirmação para ações sensíveis.",
      },
      {
        number: "03",
        title: "Fala. Mesmo fora do chat.",
        label: "VOZ + OVERLAY",
        description:
          "Uma hotkey global e uma cápsula de voz independente. Transcrição local opcional; respostas faladas através do serviço Edge da Microsoft.",
      },
    ],
    note: "* A disponibilidade depende da configuração. A voz precisa de dependências opcionais que não vêm no instalador base.",
  },
  privacy: {
    eyebrow: "Privacidade & segurança",
    title: ["Confiança começa", "com clareza."],
    intro:
      "Escolhas visíveis, permissões com limites e documentação aberta. Para perceberes o que o NANO faz com os teus dados e com o teu computador.",
    points: [
      {
        number: "01",
        title: "Sabes para onde vai o contexto.",
        description:
          "LOCAL usa o modelo no teu PC. Em AUTO e CLOUD, mensagens, contexto relevante e resultados de ferramentas podem ser enviados ao provedor. Em AUTO, uma tentativa que falhou pode já ter recebido esses dados.",
      },
      {
        number: "02",
        title: "Pedir não é ter permissão.",
        description:
          "O modelo propõe ações; o sistema valida e aplica políticas e permissões antes de executar. As ações sensíveis pedem confirmação com a ação, o alvo e o âmbito.",
      },
      {
        number: "03",
        title: "Credenciais com o seu próprio lugar.",
        description:
          "No Windows, as chaves guardadas pelo NANO são protegidas por DPAPI, separadas das conversas. A interface recebe apenas uma indicação mascarada, não a chave completa.",
      },
    ],
    trust:
      "O projeto tem fronteiras de segurança e testes dedicados. Continua em Beta e tem limitações documentadas.",
    privacyLink: "Privacidade",
    securityLink: "Segurança",
    disclosure: "O que devo saber sobre voz, memória e ferramentas?",
    disclosureText: [
      "As respostas faladas usam Microsoft Edge TTS: o texto a ler sai do computador em todos os modos. Podes desligá-las em Definições → Voz. A transcrição, quando configurada, é local.",
      "Resultados de ferramentas, como texto de um ficheiro ou da área de transferência, podem integrar o contexto enviado ao provedor. Apagar uma conversa não apaga as memórias de longo prazo extraídas dela: estas são geridas à parte, na Memória.",
    ],
  },
  story: {
    eyebrow: "Uma ideia pessoal",
    createdBy: "CRIADO POR",
    role: "Programador português de 16 anos",
    onGithub: " no GitHub",
    independent: "Projeto independente",
    title: ["Começou com uma ideia.", "Está a ganhar forma."],
    lead: "E se um assistente fizesse parte do computador — e conhecesse um pouco melhor o contexto de quem o usa?",
    body: [
      `O NANO é um projeto criado por ${site.creator.name}, programador português de 16 anos, para explorar essa ideia: juntar inteligência local e cloud, memória, voz e interação com o Windows numa experiência que faça sentido no dia a dia.`,
      "A ambição é dar-lhe progressivamente mais capacidade de ajudar e agir, mantendo limites claros. Ainda há caminho a percorrer. A Beta é uma etapa desse trabalho, feita de melhorias concretas e aprendizagem com o uso.",
    ],
    follow: "Acompanha a construção no GitHub",
  },
  development: {
    eyebrow: "Em aberto. Em evolução.",
    title: "Podes ver o caminho.",
    intro:
      "Código, decisões e limitações à vista. O NANO está em desenvolvimento ativo e a Beta ainda tem arestas por limar.",
    repoLabel: "REPOSITÓRIO PÚBLICO",
    repoTitle: "NANO, por dentro.",
    repoText:
      "Explora o código, lê a documentação e acompanha as próximas alterações.",
    viewGithub: "Ver no GitHub",
    roadmap: [
      {
        status: "AGORA",
        current: true,
        title: `Beta ${site.version}`,
        text: "Conversas persistentes, Memory / RAG, Brain, modelos locais e cloud, voz opcional e PC Control.",
      },
      {
        status: "A SEGUIR",
        current: false,
        title: "Já está no código.",
        text: "Interface em inglês que segue o idioma do Windows, lembretes com notificações do Windows, Agenda, anexos de ficheiros e modos de trabalho. Chegam na próxima versão.",
      },
      {
        status: "A EVOLUIR",
        current: false,
        title: "Consolidar a experiência.",
        text: "Validação em Windows limpo, voz em uso real, instalador assinado, atualizações automáticas e revisão de segurança são pontos ainda em aberto.",
      },
    ],
    roadmapNote:
      "Direções baseadas nos pontos públicos pendentes. Sem datas prometidas. Atualizações automáticas ainda não estão disponíveis.",
    openItems: "Consultar os pontos em aberto",
    changelog: "Changelog",
    docs: "Documentação",
    support: "Suporte e feedback",
    betaLabel: "Beta pública",
  },
  faq: {
    eyebrow: "Perguntas",
    title: "Perguntas frequentes.",
    items: [
      {
        q: "O NANO é gratuito?",
        a: "Sim. O NANO é gratuito e de código aberto, com licença Apache 2.0. Se usares um provedor cloud, a tua chave de API segue os limites e preços desse provedor. O modo LOCAL com Ollama não tem custos de provedor.",
      },
      {
        q: "Em que línguas fala o NANO?",
        a: "Podes conversar na tua língua: o modelo responde na língua em que escreves. A interface da Beta atual está em português europeu. A interface em inglês, que segue o idioma do Windows, já está no código e chega na próxima versão.",
      },
      {
        q: "Funciona sem internet?",
        a: "Em LOCAL, o modelo de linguagem corre no teu PC através do Ollama, por isso o chat funciona offline depois de instalares o Ollama e um modelo. As respostas faladas e os pedidos web continuam a precisar de rede.",
      },
      {
        q: "Que modelos de IA posso usar?",
        a: "Modelos locais através do Ollama, ou modelos cloud da Groq, Mistral ou Google Gemini com a tua chave de API. Basta um destes para começar.",
      },
      {
        q: "Porque é que o Windows mostra um aviso ao instalar?",
        a: "O instalador ainda não tem assinatura digital, por isso o Windows SmartScreen pode dizer que não reconhece o editor. Descarrega apenas da release oficial no GitHub e compara o checksum SHA-256. Nunca desatives a segurança do Windows.",
      },
      {
        q: "Onde ficam as minhas conversas?",
        a: "No teu PC, em %LOCALAPPDATA%\\NanoAssistant, junto com as memórias e as definições. As chaves de API são protegidas pelo DPAPI do Windows. Em CLOUD e AUTO, as mensagens que envias vão para o provedor que usas.",
      },
      {
        q: "Há versão para Mac ou Linux?",
        a: "Para já não. O NANO é feito para Windows 10 e 11 (64 bits), porque o PC Control trabalha diretamente com o Windows.",
      },
      {
        q: "Como atualizo?",
        a: "Por agora, as atualizações são manuais. Faz uma cópia da pasta de dados, desinstala a versão antiga (as conversas, memórias e chaves ficam guardadas) e instala a nova a partir da página da release.",
      },
    ],
  },
  download: {
    eyebrow: "O próximo passo é teu",
    title: "Dá espaço ao NANO.",
    tagline: "O teu assistente pessoal, no teu Windows.",
    button: "Descarregar NANO",
    beta: "Beta pública",
    requirements: "Windows 10/11 x64",
    destination: `Descarrega ${site.installer} da release oficial no GitHub.`,
    releaseNotes: "Notas da versão",
    mobileNote:
      "O NANO é uma aplicação para Windows. Abre esta página no teu PC para o descarregar.",
    stepsLabel: "INSTALA EM TRÊS PASSOS",
    steps: [
      {
        title: "Descarrega",
        text: "Obtém o instalador da release oficial. Se quiseres, confirma o checksum SHA-256 (ver abaixo).",
      },
      {
        title: "Instala",
        text: "Abre o instalador. Não precisas de Python, Node.js nem de conta de administrador. Se o SmartScreen avisar, confirma que o ficheiro veio da release oficial antes de escolher Mais informações → Executar mesmo assim.",
      },
      {
        title: "Escolhe a tua IA",
        text: "Abre o Nano Assistant pelo menu Iniciar. No guia inicial, adiciona uma chave cloud (Groq, Google ou Mistral) ou escolhe um modelo local do Ollama.",
      },
    ],
    noticeLabel: "ANTES DE INSTALAR",
    noticeTitle: "Uma Beta, com transparência.",
    notice:
      "O instalador ainda não está assinado. O Windows pode mostrar um aviso de editor desconhecido ou do SmartScreen. Confirma a origem e o checksum.",
    noticeStrong: "Não desatives a segurança do Windows.",
    notice2:
      "As atualizações são manuais. A instalação num Windows totalmente limpo ainda não foi validada nesta release. Guarda cópias dos dados importantes e lê as notas antes de instalar.",
    checkLabel: "VERIFICA A DESCARGA",
    checkText:
      "Compara o valor do ficheiro com o resultado deste comando no PowerShell, na pasta da descarga:",
    guide: "Guia da primeira execução",
  },
  footer: {
    back: "NANO — voltar ao início",
    label: "Rodapé",
    privacy: "Privacidade",
    security: "Segurança",
    support: "Suporte",
    tagline: "Um assistente pessoal. Uma construção contínua.",
  },
};
