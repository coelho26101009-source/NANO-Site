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
      "A free, open-source personal AI assistant for Windows, with an Android companion app. Chat, memory, voice and PC control, with local or cloud models of your choice. Try NANO Beta 4.",
    ogEyebrow: "NANO · FOR WINDOWS",
    ogTitle: "Your personal assistant.",
    ogTagline: "Local when you want. Cloud when you need.",
    ogBeta: "Public beta",
  },
  marquee: ["Listens", "Remembers", "Acts", "Asks first"],
  skip: "Skip to content",
  language: {
    // Link to the other language.
    label: "PT",
    name: "Português",
    href: "/pt?lang=pt",
    hrefLang: "pt-PT",
    aria: "PT, ver o site em português",
  },
  nav: {
    items: [
      { label: "Product", href: "#product" },
      { label: "New", href: "#new" },
      { label: "Island", href: "#island" },
      { label: "Brain", href: "#brain" },
      { label: "Phone", href: "#phone" },
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
    year: "NANO / 2026",
    based: "Made in Porto, Portugal",
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
      "Listening state recorded with demo data.",
      "Speech recognition on the PC installs in one click.",
    ],
    openCapture: "Open full capture",
    assetNote:
      "Official captures of NANO from a demo profile with fictional data.",
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
      alt: "NANO home screen: chats on the left, a greeting by name, the message field and suggestions.",
      width: 1920,
      height: 1032,
    },
    {
      id: "thinking",
      number: "02",
      label: "Long answers",
      name: "Open beside",
      title: "Code and long answers, beside the chat.",
      description:
        "A long answer or a block of code opens in a side panel, so you can read and copy it while the conversation carries on.",
      image: "/screenshots/nano-thinking.png",
      alt: "A Python answer from NANO open in the side panel, next to the conversation.",
      width: 1920,
      height: 1032,
    },
    {
      id: "conversation",
      number: "03",
      label: "With context",
      name: "Conversation",
      title: "It remembers what matters.",
      description:
        "Ask for help and NANO uses what it knows about you. Here a local model plans a study session around your weak spot.",
      image: "/screenshots/nano-conversation.png",
      alt: "A demo conversation in NANO: a short study plan from the local model that starts with fractions.",
      width: 1920,
      height: 1032,
    },
    {
      id: "voice",
      number: "04",
      label: "Beyond the window",
      name: "Island",
      title: "A voice, one shortcut away.",
      description:
        "Ctrl + Shift + Space and the island at the top of the screen starts listening, outside the main window; Ctrl + Shift + M opens full-screen voice mode.",
      image: "/screenshots/nano-overlay.png",
      alt: "The NANO island at the top of the screen while listening, with a timer and live sound bars.",
      width: 1520,
      height: 360,
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
    alt: "NANO Memory page with seven demo memories about a fictional student, each marked as created by the user.",
    openCapture: "Open the full NANO Brain capture",
    openCaptureShort: "Open full capture",
    stored: "Context stored locally",
    stats: "7 demo memories · fictional data",
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
          "A global hotkey, the island at the top of the screen and full-screen voice mode, in English or Portuguese. Spoken replies start at the first sentence, through Microsoft's Edge service; speech recognition on the PC installs in one click.",
      },
    ],
    note: "* Availability depends on your setup. Speech recognition on the PC uses a speech pack that NANO downloads in one click.",
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
      "Seeing the screen is off until you turn it on in Settings → Privacy, and it asks every time. In AUTO and CLOUD the picture goes to your cloud vision provider; in LOCAL only a model on your PC sees it.",
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
        text: "The island, a 3D Second Brain, deep research with sources, memory of old conversations, the phone camera, encrypted access away from home and automatic updates.",
      },
      {
        status: "NEXT",
        current: false,
        title: "Coming next.",
        text: "A signed installer, the Android app on the Play Store, and more of NANO on the phone away from home.",
      },
      {
        status: "EVOLVING",
        current: false,
        title: "Polish the experience.",
        text: "Testing on clean Windows installs, voice and vision in real use, and security review are still open.",
      },
    ],
    roadmapNote:
      "Directions based on the public open items. No promised dates.",
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
        a: "NANO's interface is in English and European Portuguese and follows your Windows language; you can change it in Settings → General. The model answers in the language you write in, and voice works in both languages.",
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
        q: "Is there a phone app?",
        a: "Yes, for Android: a companion for the NANO on your PC, with chats, memory, agenda, voice, camera and reminders, at home or away. It is a test build you install from the GitHub release (APK); it is not on the Play Store yet. There is no iPhone app.",
      },
      {
        q: "Is there a Mac or Linux version?",
        a: "Not at the moment. NANO is built for Windows 10 and 11 (64-bit), because PC Control works directly with Windows.",
      },
      {
        q: "How do I update?",
        a: "From Beta 4, NANO updates itself on your PC and on your phone. Coming from Beta 3 or older, install Beta 4 by hand once, over the old version: your conversations, memories and keys stay in %LOCALAPPDATA%\\NanoAssistant. A backup of that folder first is still a good idea.",
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
      "NANO runs on Windows. On your phone, get the Android app below, then pair it with NANO on your PC.",
    phoneLink: "On Android? Get the phone app",
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
      "From Beta 4, NANO updates itself. Installing on a completely clean Windows is still being validated. Back up important data and read the notes before installing.",
    checkLabel: "VERIFY THE DOWNLOAD",
    checkText:
      "Compare the value in the file with the result of this PowerShell command, in the download folder:",
    guide: "First-run guide",
  },
  whatsNew: {
    eyebrow: "New in Beta 4",
    title: ["A NANO that remembers,", "researches and goes with you."],
    intro:
      "The fourth public beta brings the island, a 3D Second Brain, deep research with sources, a memory of old conversations, the phone camera, encrypted access away from home and automatic updates.",
    items: [
      {
        label: "ISLAND",
        title: "A quiet island on screen.",
        text: "A small island at the top of the screen shows what NANO is doing, your reminders, PC alerts and the music that is playing.",
      },
      {
        label: "RESEARCH",
        title: "Deep research, with sources.",
        text: "Ask a big question and NANO searches several sources, reads them and writes a report with the links it used.",
      },
      {
        label: "MEMORY",
        title: "It remembers old conversations.",
        text: "Ask about something you talked about weeks ago: NANO finds it and shows which conversation it came from.",
      },
      {
        label: "SECOND BRAIN",
        title: "Your Second Brain, in 3D.",
        text: "What NANO knows about you, as a 3D map of people, projects and topics that you can turn, search and open.",
      },
      {
        label: "PHONE",
        title: "The camera, and away from home.",
        text: "Show NANO something with your phone camera, with a yes each time. Away from home, the phone reaches your PC through an encrypted relay.",
      },
      {
        label: "UPDATES",
        title: "It updates itself.",
        text: "NANO on your PC and on your phone now updates on its own. Plus voice ready in one click, a personality, protocols you trigger with a phrase and 50 fixes.",
      },
    ],
    voiceAlt:
      "NANO full-screen voice mode: the N symbol in a ring, the last question and NANO's answer.",
    voiceCaption:
      "Full-screen voice mode (Ctrl + Shift + M). Listening state simulated in the capture.",
    agendaAlt:
      "NANO Agenda with fictional reminders and events: a maths exam, a dentist appointment and football practice.",
    agendaCaption:
      "Agenda: reminders that repeat, events and Windows notifications.",
    notes: "Read the release notes",
    changelog: "Full changelog",
  },
  phone: {
    eyebrow: "NANO on your phone",
    title: ["Your PC's NANO,", "in your pocket."],
    intro:
      "A companion app for Android. It is a remote for the NANO on your PC: the PC does the work, the phone talks to it.",
    points: [
      {
        title: "Same chats, memory and agenda.",
        text: "Pick up a conversation started on the PC, add a reminder or check tomorrow. Talk to it, have answers read aloud, or show it something with the camera.",
      },
      {
        title: "Reminders that ring.",
        text: "Your reminders are copied to the phone, so they ring even with the app closed.",
      },
      {
        title: "Private by design.",
        text: "Pair with a QR code, a 6-digit code and a yes on the PC. Every message is encrypted end to end and only goes to your own PC: directly on your home Wi-Fi, or through an encrypted relay away from home that cannot read it. No port is opened to the internet.",
      },
    ],
    button: "Download for Android (APK)",
    meta: ["Android 7 or newer", "Test build", "Not on the Play Store yet"],
    guide: "Step-by-step phone guide",
    note: `Needs NANO ${site.version} on your PC. Android asks you to allow installs from your browser, and Play Protect may call the app unknown, because this build is not from the Play Store.`,
    chatAlt:
      "NANO Android app: a conversation about tomorrow's maths exam and a reminder, with fictional data.",
    agendaAlt:
      "NANO Android app agenda: today's reminder and tomorrow's exam and dentist appointment, with fictional data.",
    captureNote: "Captures from a demo with fictional data.",
  },
  island: {
    eyebrow: "Ambient mode · New in Beta 4",
    title: ["Always there.", "Never in the way."],
    intro:
      "A small island at the top of your screen shows what NANO is doing: listening, thinking, a tool at work, an approval waiting for you, a reminder, the song that is playing. Hover it for more, click it to open NANO.",
    videoLabel:
      "Recording of the NANO island going through its states: listening, thinking, speaking, searching the web, asking for approval, a reminder, low battery, a finished download, music and volume.",
    caption:
      "Recorded from NANO's real island with demo data. On Windows it uses the Segoe UI font.",
    states: [
      {
        id: "listening",
        label: "VOICE",
        title: "Listening, thinking, speaking.",
        text: "You always know when the microphone is open and when NANO is answering.",
        alt: "The island while listening: a microphone, a timer and live sound bars.",
      },
      {
        id: "working",
        label: "TOOLS",
        title: "A tool at work.",
        text: "Searching the web, opening an app or reading a file shows up while it happens.",
        alt: "The island while NANO searches the web, with a moving progress line.",
      },
      {
        id: "approval",
        label: "APPROVALS",
        title: "It asks first.",
        text: "A sensitive action waits for you, in amber. You answer in NANO, never by accident on the island.",
        alt: "The island asking for approval to close a Discord window, with an amber outline.",
      },
      {
        id: "reminder",
        label: "REMINDERS",
        title: "Right on time.",
        text: "Reminders and agenda heads-ups appear at the top of the screen without stealing your focus.",
        alt: "The island showing a reminder at 18:30 for robotics practice.",
      },
      {
        id: "battery",
        label: "PC ALERTS",
        title: "An eye on your PC.",
        text: "Low battery, a full disk, the network gone or back, a download that just finished.",
        alt: "The island warning that the battery is at 18%.",
      },
      {
        id: "player",
        label: "MUSIC",
        title: "Music and volume.",
        text: "The song that is playing, with pause and skip on hover, and the volume as you change it.",
        alt: "The island opened as a music player: cover, song, progress bar and controls.",
      },
    ],
    note: "Ambient mode can be switched off in Settings: the island then only appears when there is something to show.",
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
