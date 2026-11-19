import { site } from "../site";

/**
 * English copy (the default language, served at `/`). `pt.ts` must have the
 * same shape: TypeScript checks it against `Copy`.
 */
export const en = {
  locale: "en",
  htmlLang: "en",
  ogLocale: "en_US",
  path: "/",
  meta: {
    title: "NANO — Your personal AI assistant for Windows",
    description:
      "A free, open-source personal AI assistant for Windows. Chat, long-term memory and PC control, with local or cloud models of your choice. Try the NANO public beta.",
    ogEyebrow: "NANO · FOR WINDOWS",
    ogTitle: "Your personal assistant.",
    ogTagline: "Local when you want. Cloud when you need.",
    ogBeta: "Public beta",
  },
  skip: "Skip to content",
  language: {
    // Link to the other language.
    label: "PT",
    name: "Português",
    href: "/pt",
    hrefLang: "pt-PT",
    aria: "Ver o site em português",
  },
  nav: {
    items: [
      { label: "Product", href: "#product" },
      { label: "Brain", href: "#brain" },
      { label: "Privacy", href: "#privacy" },
      { label: "FAQ", href: "#faq" },
      { label: "About", href: "#about" },
    ],
    home: "NANO — home",
    main: "Main navigation",
    mobile: "Mobile navigation",
    menu: "Navigation menu",
    download: "Download",
    viewGithub: "View on GitHub",
  },
  hero: {
    badge: "Public beta",
    eyebrow: "NANO · AI assistant for Windows",
    title: ["Your personal", "assistant."],
    tagline: ["Local when you want.", "Cloud when you need."],
    download: "Download for Windows",
    github: "View on GitHub",
    meta: ["Free and open source", "Windows 10/11 x64"],
    discover: "Meet NANO",
    motto: "Your computer. Your context. Your choice.",
    artCaption: "Intelligence. With presence.",
  },
  product: {
    eyebrow: "Made for your everyday",
    title: ["An AI that lives", "with you on your PC."],
    intro:
      "Chat, memory and Windows control in one place. Choose between local and cloud models, pick up where you left off, and use your voice when you are ready.",
  },
  showcase: {
    tabs: "Explore the app",
    voiceEyebrow: "A quiet presence",
    voiceLead: "The conversation comes with you.",
    shortcutLabel: "Control plus Shift plus Space",
    voiceNote: [
      "Listening state simulated in the official capture.",
      "Voice is optional and needs extra setup.",
    ],
    openCapture: "Open full capture",
    assetNote:
      "Official captures from a demo profile, showing the Portuguese interface of an earlier build.",
    noscript: "The other captures are available in the",
    noscriptLink: "official repository",
  },
  experiences: [
    {
      id: "home",
      number: "01",
      label: "Your space",
      name: "Home",
      title: "A conversation starts here.",
      description:
        "A calm place to think, ask and take the next step, with your conversations always at hand.",
      image: "/screenshots/nano-home.png",
      alt: "Real NANO home screen: history on the left, the N symbol and a field for a new message.",
      width: 1920,
      height: 1032,
    },
    {
      id: "thinking",
      number: "02",
      label: "Thinking with you",
      name: "Thinking",
      title: "See what is happening.",
      description:
        "The request status and the model in use are part of the conversation. In this capture, NANO is working on a local request.",
      image: "/screenshots/nano-thinking.png",
      alt: "NANO processing a request with the local Ollama model, in a demo profile.",
      width: 1920,
      height: 1032,
    },
    {
      id: "conversation",
      number: "03",
      label: "With context",
      name: "Conversation",
      title: "Pick up the thread.",
      description:
        "Go back to an earlier conversation and continue where you stopped. NANO rebuilds the context from its messages and summary.",
      image: "/screenshots/nano-conversation.png",
      alt: "Real demo conversation in NANO, with the local model's answer visible.",
      width: 1920,
      height: 1032,
    },
    {
      id: "voice",
      number: "04",
      label: "Beyond the window",
      name: "Voice overlay",
      title: "A voice, one shortcut away.",
      description:
        "With voice set up, Ctrl + Shift + Space opens a capsule separate from the main window. Local transcription needs optional components.",
      image: "/screenshots/nano-overlay.png",
      alt: "Official capture of the NANO voice capsule, with a simulated listening state in Electron, on a light background.",
      width: 760,
      height: 180,
    },
  ],
  modes: {
    eyebrow: "Three modes. Your choice.",
    title: ["The intelligence changes.", "You stay in control."],
    intro: [
      "Choose where NANO thinks, with clear paths",
      "to your local model and your cloud providers.",
    ],
    path: "Path",
    items: [
      {
        id: "local",
        number: "01",
        title: "LOCAL",
        subtitle: "Your PC. Your model.",
        description:
          "Chat with local models through Ollama. Requests to the model stay on your computer, with no cloud AI provider involved.",
        path: ["You", "Ollama", "Answer"],
        footnote: "Needs Ollama and a model, installed separately.",
        tag: "On-device inference",
      },
      {
        id: "auto",
        number: "02",
        title: "AUTO",
        subtitle: "Continuity, with judgement.",
        description:
          "Starts with your preferred cloud. If needed, it tries your other available providers, with Ollama as the last resort.",
        path: ["Preferred cloud", "Alternatives", "Ollama"],
        footnote: "Respects availability and limits. Every attempt is logged.",
        tag: "Controlled failover",
      },
      {
        id: "cloud",
        number: "03",
        title: "CLOUD",
        subtitle: "The cloud you chose.",
        description:
          "Uses only your preferred cloud provider. If it is unavailable, NANO tells you. It does not switch provider or fall back to Ollama.",
        path: ["You", "Chosen cloud", "Answer"],
        footnote: "Groq, Mistral or Google Gemini. Needs your own API key.",
        tag: "An explicit choice",
      },
    ],
    caveatStrong: "LOCAL refers to the language model.",
    caveat:
      "Spoken replies send text to Microsoft, even in LOCAL. Web browsing requests use the network too. In AUTO, more than one provider may receive a request during failover.",
    caveatLink: "Read more about privacy",
  },
  brain: {
    eyebrow: "NANO Brain",
    title: ["A memory", "that makes sense."],
    intro: [
      "Some context is worth keeping.",
      "NANO keeps long-term memories and brings back what is relevant to the conversation.",
    ],
    more: "Learn about the Brain",
    alt: "Real NANO Brain graph: My PC linked to Ollama and the NANO project, with three demo nodes and two relations.",
    openCapture: "Open the full NANO Brain capture",
    openCaptureShort: "Open full capture",
    stored: "Context stored locally",
    stats: "3 demo nodes · 2 real relations",
    details: [
      {
        label: "01 / KEEP",
        title: "What you choose to remember.",
        text: "Memories are extracted locally. Explicit requests can stay active; inferences follow confidence rules.",
      },
      {
        label: "02 / CONNECT",
        title: "Links with an origin.",
        text: "Nodes come from active memories or from something you did. Relations appear when two nodes show up in the same memory.",
      },
      {
        label: "03 / RECALL",
        title: "Context, when it matters.",
        text: "Recall combines relevant memories with the conversation history. The Brain is still maturing with real use.",
      },
    ],
    note: "Storing memories locally does not stop relevant context from being sent to the model in AUTO or CLOUD.",
    noteLink: "See how data is used.",
  },
  capabilities: {
    eyebrow: "Beyond the answer",
    title: ["One conversation.", "More possibilities."],
    intro: "Real tools for your computer, connected to the conversation.",
    availability: "Available in the beta",
    items: [
      {
        number: "01",
        title: "Conversations that continue.",
        label: "CHAT + HISTORY",
        description:
          "Create, search, resume and organise conversations. History and long-term memory have separate roles, to keep the context relevant.",
      },
      {
        number: "02",
        title: "Closer to Windows.",
        label: "PC CONTROL",
        description:
          "Open apps, arrange windows, adjust the volume or check your PC's status. Tools with a defined scope, and confirmation for sensitive actions.",
      },
      {
        number: "03",
        title: "Talk. Even outside the chat.",
        label: "VOICE + OVERLAY",
        description:
          "A global hotkey and a separate voice capsule. Optional local transcription; spoken replies through Microsoft's Edge service.",
      },
    ],
    note: "* Availability depends on your setup. Voice needs optional components that are not in the base installer.",
  },
  privacy: {
    eyebrow: "Privacy & security",
    title: ["Trust starts", "with clarity."],
    intro:
      "Visible choices, permissions with limits and open documentation, so you understand what NANO does with your data and your computer.",
    points: [
      {
        number: "01",
        title: "You know where the context goes.",
        description:
          "LOCAL uses the model on your PC. In AUTO and CLOUD, messages, relevant context and tool results may be sent to the provider. In AUTO, an attempt that failed may already have received that data.",
      },
      {
        number: "02",
        title: "Asking is not permission.",
        description:
          "The model proposes actions; the system checks policies and permissions before running them. Sensitive actions ask for confirmation, showing the action, the target and the scope.",
      },
      {
        number: "03",
        title: "Credentials in their own place.",
        description:
          "On Windows, the keys NANO stores are protected with DPAPI, separate from your conversations. The interface only gets a masked hint, never the full key.",
      },
    ],
    trust:
      "The project has security boundaries and dedicated tests. It is still a beta, with documented limitations.",
    privacyLink: "Privacy",
    securityLink: "Security",
    disclosure: "What should I know about voice, memory and tools?",
    disclosureText: [
      "Spoken replies use Microsoft Edge TTS: the text to read leaves your computer in every mode. You can turn them off in Settings → Voice. Transcription, when set up, is local.",
      "Tool results, such as text from a file or the clipboard, can become part of the context sent to the provider. Deleting a conversation does not delete the long-term memories taken from it: those are managed separately, in Memory.",
    ],
  },
  story: {
    eyebrow: "A personal idea",
    createdBy: "CREATED BY",
    role: "16-year-old developer from Portugal",
    onGithub: " on GitHub",
    independent: "Independent project",
    title: ["It started with an idea.", "It is taking shape."],
    lead: "What if an assistant were part of the computer — and knew a little more about the person using it?",
    body: [
      `NANO is a project by ${site.creator.name}, a 16-year-old developer from Portugal, built to explore that idea: bringing local and cloud intelligence, memory, voice and Windows control together in an experience that makes sense every day.`,
      "The goal is to give it more ability to help and act over time, while keeping clear limits. There is still a way to go. The beta is one step of that work, made of concrete improvements and lessons from real use.",
    ],
    follow: "Follow the build on GitHub",
  },
  development: {
    eyebrow: "Open. Evolving.",
    title: "You can see the road.",
    intro:
      "Code, decisions and limitations in the open. NANO is in active development and the beta still has rough edges.",
    repoLabel: "PUBLIC REPOSITORY",
    repoTitle: "NANO, from the inside.",
    repoText: "Browse the code, read the docs and follow the next changes.",
    viewGithub: "View on GitHub",
    roadmap: [
      {
        status: "NOW",
        current: true,
        title: `Beta ${site.version}`,
        text: "Persistent conversations, Memory / RAG, Brain, local and cloud models, optional voice and PC Control.",
      },
      {
        status: "NEXT",
        current: false,
        title: "Already in the code.",
        text: "English interface that follows your Windows language, reminders with Windows notifications, an Agenda, file attachments and work modes. Coming in the next release.",
      },
      {
        status: "EVOLVING",
        current: false,
        title: "Polish the experience.",
        text: "Testing on clean Windows installs, voice in real use, a signed installer, automatic updates and security review are still open.",
      },
    ],
    roadmapNote:
      "Directions based on the public open items. No promised dates. Automatic updates are not available yet.",
    openItems: "See the open items",
    changelog: "Changelog",
    docs: "Documentation",
    support: "Support and feedback",
    betaLabel: "Public beta",
  },
  faq: {
    eyebrow: "Questions",
    title: "Frequently asked questions.",
    items: [
      {
        q: "Is NANO free?",
        a: "Yes. NANO is free and open source under the Apache 2.0 licence. If you use a cloud provider, your API key follows that provider's own limits and pricing. LOCAL mode with Ollama has no provider costs.",
      },
      {
        q: "Which languages does NANO speak?",
        a: "You can chat in your own language: the model answers in the language you write in. The interface of the current beta is in European Portuguese. An English interface that follows your Windows language is already in the code and arrives with the next release.",
      },
      {
        q: "Does it work without the internet?",
        a: "In LOCAL mode, the language model runs on your PC through Ollama, so chat works offline once Ollama and a model are installed. Spoken replies and web requests still need the network.",
      },
      {
        q: "Which AI models can I use?",
        a: "Local models through Ollama, or cloud models from Groq, Mistral or Google Gemini with your own API key. You only need one of these to start.",
      },
      {
        q: "Why does Windows show a warning when I install it?",
        a: "The installer is not code-signed yet, so Windows SmartScreen may say it does not recognise the publisher. Download only from the official GitHub release and compare the SHA-256 checksum. Never turn off Windows security.",
      },
      {
        q: "Where are my conversations stored?",
        a: "On your PC, in %LOCALAPPDATA%\\NanoAssistant, together with your memories and settings. API keys are protected with Windows DPAPI. In CLOUD and AUTO, the messages you send go to the provider you use.",
      },
      {
        q: "Is there a Mac or Linux version?",
        a: "Not at the moment. NANO is built for Windows 10 and 11 (64-bit), because PC Control works directly with Windows.",
      },
      {
        q: "How do I update?",
        a: "Updates are manual for now. Back up your data folder, uninstall the old version (your conversations, memories and keys are kept) and install the new one from the release page.",
      },
    ],
  },
  download: {
    eyebrow: "The next step is yours",
    title: "Make room for NANO.",
    tagline: "Your personal assistant, on your Windows PC.",
    button: "Download NANO",
    beta: "Public beta",
    requirements: "Windows 10/11 x64",
    destination: `Downloads ${site.installer} from the official GitHub release.`,
    releaseNotes: "Release notes",
    mobileNote:
      "NANO is a Windows app. Open this page on your PC to download it.",
    stepsLabel: "INSTALL IN THREE STEPS",
    steps: [
      {
        title: "Download",
        text: "Get the installer from the official release. Optionally, check its SHA-256 checksum (see below).",
      },
      {
        title: "Install",
        text: "Run the installer. No Python, Node.js or admin account needed. If SmartScreen warns you, confirm the file came from the official release before choosing More info → Run anyway.",
      },
      {
        title: "Choose your AI",
        text: "Open Nano Assistant from the Start menu. In the first-run guide, add a cloud key (Groq, Google or Mistral) or pick a local Ollama model.",
      },
    ],
    noticeLabel: "BEFORE YOU INSTALL",
    noticeTitle: "A beta, with transparency.",
    notice:
      "The installer is not signed yet. Windows may show an unknown publisher or SmartScreen warning. Check the source and the checksum.",
    noticeStrong: "Do not turn off Windows security.",
    notice2:
      "Updates are manual. Installing on a completely clean Windows has not been validated for this release yet. Back up important data and read the notes before installing.",
    checkLabel: "VERIFY THE DOWNLOAD",
    checkText:
      "Compare the value in the file with the result of this PowerShell command, in the download folder:",
    guide: "First-run guide",
  },
  footer: {
    back: "NANO — back to top",
    label: "Footer",
    privacy: "Privacy",
    security: "Security",
    support: "Support",
    tagline: "A personal assistant. Always being built.",
  },
};

export type Copy = typeof en;
