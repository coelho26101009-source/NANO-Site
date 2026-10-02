const repository = "https://github.com/coelho26101009-source/Nano_Assistant";
const version = "0.2.0-beta.1";

export const site = {
  name: "NANO",
  locale: "pt-PT",
  title: "NANO — Assistente pessoal de IA para Windows",
  description:
    "O teu assistente pessoal de IA para Windows. Conversa, memória e interação com o PC, com modelos locais ou cloud à tua escolha. Conhece a Beta pública do NANO.",
  version,
  // Public creator identity, as provided by the creator.
  creator: {
    name: "Simão Coelho",
    role: "Programador português de 16 anos",
    handle: "coelho26101009-source",
  },
  repository,
  release: `${repository}/releases/tag/v${version}`,
  checksum: `${repository}/releases/download/v${version}/SHA256SUMS.txt`,
  installer: `Nano-Setup-${version}-x64.exe`,
  links: {
    privacy: `${repository}/blob/main/PRIVACY.md`,
    security: `${repository}/blob/main/SECURITY.md`,
    changelog: `${repository}/blob/main/CHANGELOG.md`,
    docs: `${repository}/blob/main/docs/README.md`,
    guide: `${repository}/blob/main/docs/BETA_GUIDE.md`,
    support: `${repository}/blob/main/SUPPORT.md`,
    checklist: `${repository}/blob/main/docs/PUBLIC_RELEASE_CHECKLIST.md`,
  },
} as const;

export const navigation = [
  { label: "Produto", href: "#produto" },
  { label: "Brain", href: "#brain" },
  { label: "Privacidade", href: "#privacidade" },
  { label: "Sobre", href: "#sobre" },
  { label: "Download", href: "#download" },
];

export const experiences = [
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
] as const;

export const modes = [
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
] as const;

export const capabilities = [
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
] as const;

export const privacyPoints = [
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
] as const;
