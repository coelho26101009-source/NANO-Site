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
      "O teu assistente pessoal de IA para Windows, gratuito e de código aberto, com uma app para Android. Conversa, memória, voz e interação com o PC, com modelos locais ou cloud à tua escolha. Experimenta a Beta 4 do NANO.",
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
    aria: "EN, view the site in English",
  },
  nav: {
    items: [
      { label: "Produto", href: "#product" },
      { label: "Novo", href: "#new" },
      { label: "Ilha", href: "#island" },
      { label: "Brain", href: "#brain" },
      { label: "Telemóvel", href: "#phone" },
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
      "Estado de escuta gravado com dados de demonstração.",
      "O reconhecimento de fala no PC instala-se com um clique.",
    ],
    openCapture: "Abrir captura completa",
    assetNote:
      "Capturas oficiais do NANO num perfil de demonstração com dados fictícios, com a interface em inglês.",
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
      alt: "Ecrã inicial do NANO: conversas à esquerda, um cumprimento pelo nome, o campo de mensagem e sugestões.",
      width: 1920,
      height: 1032,
    },
    {
      id: "thinking",
      number: "02",
      label: "Respostas longas",
      name: "Abrir ao lado",
      title: "Código e respostas longas, ao lado do chat.",
      description:
        "Uma resposta longa ou um bloco de código abre num painel lateral, para leres e copiares enquanto a conversa continua.",
      image: "/screenshots/nano-thinking.png",
      alt: "Uma resposta em Python do NANO aberta no painel lateral, ao lado da conversa.",
      width: 1920,
      height: 1032,
    },
    {
      id: "conversation",
      number: "03",
      label: "Com contexto",
      name: "Conversation",
      title: "Lembra-se do que importa.",
      description:
        "Pede ajuda e o NANO usa o que sabe sobre ti. Aqui, um modelo local planeia uma sessão de estudo à volta da tua dificuldade.",
      image: "/screenshots/nano-conversation.png",
      alt: "Uma conversa de demonstração no NANO: um plano de estudo curto do modelo local que começa pelas frações.",
      width: 1920,
      height: 1032,
    },
    {
      id: "voice",
      number: "04",
      label: "Para lá da janela",
      name: "Ilha",
      title: "Uma voz ao alcance de um atalho.",
      description:
        "Ctrl + Shift + Espaço e a ilha no topo do ecrã começa a ouvir, fora da janela principal; Ctrl + Shift + M abre o modo de voz em ecrã inteiro.",
      image: "/screenshots/nano-overlay-pt.png",
      alt: "A ilha do NANO no topo do ecrã a ouvir, com um contador e barras de som ao vivo.",
      width: 1520,
      height: 360,
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
    alt: "Página Memória do NANO com sete memórias de demonstração sobre um estudante fictício, todas criadas pelo utilizador.",
    openCapture: "Abrir a captura completa do NANO Brain",
    openCaptureShort: "Abrir captura completa",
    stored: "Contexto guardado localmente",
    stats: "7 memórias de demonstração · dados fictícios",
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
          "Uma hotkey global, a ilha no topo do ecrã e um modo de voz em ecrã inteiro, em português ou inglês. As respostas faladas começam logo na primeira frase, através do serviço Edge da Microsoft; o reconhecimento de fala no PC instala-se com um clique.",
      },
    ],
    note: "* A disponibilidade depende da configuração. O reconhecimento de fala no PC usa um pacote de voz que o NANO descarrega com um clique.",
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
      "Ver o ecrã está desligado até o ligares em Definições → Privacidade, e pergunta sempre. Em AUTO e CLOUD a imagem vai para o teu provedor de visão na cloud; em LOCAL só um modelo no teu PC a vê.",
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
        text: "A ilha, um Segundo Cérebro em 3D, investigação profunda com fontes, memória de conversas antigas, a câmara do telemóvel, acesso cifrado fora de casa e atualizações automáticas.",
      },
      {
        status: "A SEGUIR",
        current: false,
        title: "O que vem a seguir.",
        text: "Instalador assinado, a app Android na Play Store e mais NANO no telemóvel fora de casa.",
      },
      {
        status: "A EVOLUIR",
        current: false,
        title: "Consolidar a experiência.",
        text: "Validação em Windows limpo, voz e visão em uso real e revisão de segurança são pontos ainda em aberto.",
      },
    ],
    roadmapNote:
      "Direções baseadas nos pontos públicos pendentes. Sem datas prometidas.",
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
        a: "A interface do NANO está em português europeu e em inglês e segue o idioma do Windows; podes mudar em Definições → Geral. O modelo responde na língua em que escreves, e a voz funciona nas duas línguas.",
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
        q: "Há uma app para telemóvel?",
        a: "Sim, para Android: acompanha o NANO do teu PC, com conversas, memória, agenda, voz, câmara e lembretes, em casa ou fora. É uma versão de teste que instalas a partir da release do GitHub (APK); ainda não está na Play Store. Não há app para iPhone.",
      },
      {
        q: "Há versão para Mac ou Linux?",
        a: "Para já não. O NANO é feito para Windows 10 e 11 (64 bits), porque o PC Control trabalha diretamente com o Windows.",
      },
      {
        q: "Como atualizo?",
        a: "A partir da Beta 4, o NANO atualiza-se sozinho no PC e no telemóvel. Se tens a Beta 3 ou anterior, instala a Beta 4 à mão uma vez, por cima da versão antiga: as conversas, memórias e chaves ficam em %LOCALAPPDATA%\\NanoAssistant. Fazer antes uma cópia dessa pasta continua a ser boa ideia.",
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
      "O NANO corre no Windows. No telemóvel, instala a app Android mais abaixo e liga-a ao NANO do teu PC.",
    phoneLink: "Tens Android? Instala a app do telemóvel",
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
      "A partir da Beta 4, o NANO atualiza-se sozinho. A instalação num Windows totalmente limpo ainda está a ser validada. Guarda cópias dos dados importantes e lê as notas antes de instalar.",
    checkLabel: "VERIFICA A DESCARGA",
    checkText:
      "Compara o valor do ficheiro com o resultado deste comando no PowerShell, na pasta da descarga:",
    guide: "Guia da primeira execução",
  },
  whatsNew: {
    eyebrow: "Novo na Beta 4",
    title: ["Um NANO que se lembra,", "investiga e vai contigo."],
    intro:
      "A quarta Beta pública traz a ilha, um Segundo Cérebro em 3D, investigação profunda com fontes, uma memória de conversas antigas, a câmara do telemóvel, acesso cifrado fora de casa e atualizações automáticas.",
    items: [
      {
        label: "ILHA",
        title: "Uma ilha discreta no ecrã.",
        text: "Uma pequena ilha no topo do ecrã mostra o que o NANO está a fazer, os teus lembretes, avisos do PC e a música que está a tocar.",
      },
      {
        label: "INVESTIGAÇÃO",
        title: "Investigação profunda, com fontes.",
        text: "Faz uma pergunta grande e o NANO pesquisa várias fontes, lê-as e escreve um relatório com os links que usou.",
      },
      {
        label: "MEMÓRIA",
        title: "Lembra-se de conversas antigas.",
        text: "Pergunta por algo de que falaste há semanas: o NANO encontra-o e mostra de que conversa veio.",
      },
      {
        label: "SEGUNDO CÉREBRO",
        title: "O teu Segundo Cérebro, em 3D.",
        text: "O que o NANO sabe sobre ti, num mapa 3D de pessoas, projetos e temas que podes rodar, pesquisar e abrir.",
      },
      {
        label: "TELEMÓVEL",
        title: "A câmara, e fora de casa.",
        text: "Mostra uma coisa ao NANO com a câmara do telemóvel, com um sim de cada vez. Fora de casa, o telemóvel chega ao PC através de um relay cifrado.",
      },
      {
        label: "ATUALIZAÇÕES",
        title: "Atualiza-se sozinho.",
        text: "O NANO no PC e no telemóvel passa a atualizar-se sozinho. E ainda: voz pronta num clique, personalidade, protocolos que lanças com uma frase e 50 correções.",
      },
    ],
    voiceAlt:
      "Modo de voz em ecrã inteiro do NANO: o símbolo N num anel, a última pergunta e a resposta do NANO.",
    voiceCaption:
      "Modo de voz em ecrã inteiro (Ctrl + Shift + M). Estado de escuta simulado na captura.",
    agendaAlt:
      "Agenda do NANO com lembretes e eventos fictícios: um teste de matemática, o dentista e um treino de futebol.",
    agendaCaption:
      "Agenda: lembretes que se repetem, eventos e notificações do Windows.",
    notes: "Ler as notas da versão",
    changelog: "Changelog completo",
  },
  phone: {
    eyebrow: "O NANO no telemóvel",
    title: ["O NANO do teu PC,", "no teu bolso."],
    intro:
      "Uma app para Android que acompanha o NANO do teu PC: o PC faz o trabalho, o telemóvel fala com ele.",
    points: [
      {
        title: "As mesmas conversas, memória e agenda.",
        text: "Continua uma conversa começada no PC, cria um lembrete ou vê o dia de amanhã. Fala com ele, ouve as respostas em voz alta ou mostra-lhe algo com a câmara.",
      },
      {
        title: "Lembretes que tocam.",
        text: "Os teus lembretes são copiados para o telemóvel, por isso tocam mesmo com a app fechada.",
      },
      {
        title: "Privado de raiz.",
        text: "Liga-se com um código QR, um código de 6 dígitos e um sim no PC. Todas as mensagens vão cifradas de ponta a ponta e só para o teu PC: diretamente no Wi-Fi de casa, ou fora de casa através de um relay cifrado que não as consegue ler. Nenhuma porta é aberta para a internet.",
      },
    ],
    button: "Descarregar para Android (APK)",
    meta: [
      "Android 7 ou mais recente",
      "Versão de teste",
      "Ainda não está na Play Store",
    ],
    guide: "Guia passo a passo do telemóvel",
    note: `Precisa do NANO ${site.version} no PC. O Android pede para permitires instalações a partir do navegador, e o Play Protect pode dizer que a app é desconhecida, porque esta versão não vem da Play Store.`,
    chatAlt:
      "App Android do NANO: uma conversa sobre o teste de matemática de amanhã e um lembrete, com dados fictícios.",
    agendaAlt:
      "Agenda da app Android do NANO: o lembrete de hoje e o teste e o dentista de amanhã, com dados fictícios.",
    captureNote: "Capturas de uma demonstração com dados fictícios.",
  },
  island: {
    eyebrow: "Modo ambiente · Novo na Beta 4",
    title: ["Sempre presente.", "Nunca no caminho."],
    intro:
      "Uma pequena ilha no topo do ecrã mostra o que o NANO está a fazer: a ouvir, a pensar, uma ferramenta a trabalhar, uma aprovação à tua espera, um lembrete, a música que está a tocar. Passa o rato para ver mais, clica para abrir o NANO.",
    videoLabel:
      "Gravação da ilha do NANO a passar pelos seus estados: a ouvir, a pensar, a falar, a pesquisar na web, a pedir aprovação, um lembrete, bateria fraca, um download terminado, música e volume.",
    caption:
      "Gravado a partir da ilha real do NANO com dados de demonstração. No Windows usa a letra Segoe UI.",
    states: [
      {
        id: "listening",
        label: "VOZ",
        title: "A ouvir, a pensar, a falar.",
        text: "Sabes sempre quando o microfone está aberto e quando o NANO está a responder.",
        alt: "A ilha a ouvir: um microfone, um contador e barras de som ao vivo.",
      },
      {
        id: "working",
        label: "FERRAMENTAS",
        title: "Uma ferramenta a trabalhar.",
        text: "Pesquisar na web, abrir uma aplicação ou ler um ficheiro aparece enquanto acontece.",
        alt: "A ilha enquanto o NANO pesquisa na web, com uma linha de progresso em movimento.",
      },
      {
        id: "approval",
        label: "APROVAÇÕES",
        title: "Pergunta primeiro.",
        text: "Uma ação sensível fica à tua espera, a âmbar. Respondes no NANO, nunca sem querer na ilha.",
        alt: "A ilha a pedir aprovação para fechar uma janela do Discord, com contorno âmbar.",
      },
      {
        id: "reminder",
        label: "LEMBRETES",
        title: "Mesmo a horas.",
        text: "Lembretes e avisos da agenda aparecem no topo do ecrã sem te tirar do que estás a fazer.",
        alt: "A ilha com um lembrete às 18:30 para o treino de robótica.",
      },
      {
        id: "battery",
        label: "AVISOS DO PC",
        title: "De olho no teu PC.",
        text: "Bateria fraca, disco cheio, a rede que caiu ou voltou, um download que acabou.",
        alt: "A ilha a avisar que a bateria está em 18%.",
      },
      {
        id: "player",
        label: "MÚSICA",
        title: "Música e volume.",
        text: "A música que está a tocar, com pausa e avançar ao passar o rato, e o volume quando o mudas.",
        alt: "A ilha aberta como leitor de música: capa, música, barra de progresso e controlos.",
      },
    ],
    note: "O Modo ambiente pode ser desligado nas Definições: a ilha passa a aparecer só quando há alguma coisa para mostrar.",
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
