import type { Lang, Localized } from "@/lib/types";

export interface LandingCopy {
  tagline: string;
  headline: string;
  sub: string;
  hostCta: string;
  travelerCta: string;
  demoLabel: string;
  demoMic: string;
  howTitle: string;
  steps: { title: string; text: string }[];
  catalogTitle: string;
  catalogSub: string;
  houses: (n: number) => string;
  openCatalog: string;
  footer: string[];
  demoNote: string;
}

function ruHouses(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} дом`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} дома`;
  return `${n} домов`;
}

export const LANDING: Record<Lang, LandingCopy> = {
  ru: {
    tagline: "Гостевые дома Казахстана",
    headline: "Говорите по-казахски. Гость прочтёт на своём языке.",
    sub: "Хозяин наговаривает про дом 60 секунд, ИИ делает страницу на 4 языках и QR-код. Без комиссии, без сайта.",
    hostCta: "Я хозяин — создать страницу за 60 секунд",
    travelerCta: "Я турист — найти жильё",
    demoLabel: "Одна фраза — четыре языка",
    demoMic: "Хозяин говорит",
    howTitle: "Как это работает",
    steps: [
      { title: "Наговорите", text: "Расскажите про дом голосом на казахском или русском. 60 секунд." },
      { title: "Получите QR", text: "ИИ делает карточку на 4 языках. Повесьте QR у ворот или отправьте в WhatsApp." },
      { title: "Отвечайте кнопкой", text: "Заявка приходит в WhatsApp по-русски. Нажали «Свободно» — турист прочёл на своём языке." },
    ],
    catalogTitle: "Уже на Qonaq",
    catalogSub: "Посмотрите, как выглядит страница глазами туриста.",
    houses: ruHouses,
    openCatalog: "Смотреть дома",
    footer: ["0% комиссии", "WhatsApp", "работает без сети"],
    demoNote: "Пример",
  },
  kk: {
    tagline: "Қазақстанның қонақ үйлері",
    headline: "Қазақша сөйлеңіз. Қонақ өз тілінде оқиды.",
    sub: "Үй туралы 60 секунд айтасыз, ИИ 4 тілде бет пен QR-код жасайды. Комиссиясыз, сайтсыз.",
    hostCta: "Мен үй иесімін — 60 секундта бет жасау",
    travelerCta: "Мен туристпін — тұратын жер табу",
    demoLabel: "Бір сөйлем — төрт тіл",
    demoMic: "Үй иесі айтады",
    howTitle: "Қалай жұмыс істейді",
    steps: [
      { title: "Айтыңыз", text: "Үйіңіз туралы қазақша немесе орысша дауыспен айтыңыз. 60 секунд." },
      { title: "QR алыңыз", text: "ИИ 4 тілде карточка жасайды. QR-ды қақпаға іліңіз немесе WhatsApp-қа жіберіңіз." },
      { title: "Түймемен жауап беріңіз", text: "Өтінім WhatsApp-қа орысша келеді. «Бос» басасыз — турист өз тілінде оқиды." },
    ],
    catalogTitle: "Qonaq-тағы үйлер",
    catalogSub: "Турист көзімен бет қалай көрінетінін қараңыз.",
    houses: (n) => `${n} үй`,
    openCatalog: "Үйлерді қарау",
    footer: ["0% комиссия", "WhatsApp", "желісіз жұмыс істейді"],
    demoNote: "Мысал",
  },
  en: {
    tagline: "Guesthouses of Kazakhstan",
    headline: "Your host speaks Kazakh. You read it in your language.",
    sub: "Book rural guesthouses in Kazakhstan, ask questions in your own language and get the answer translated. No commission, no website needed.",
    hostCta: "I'm a host — create a page in 60 seconds",
    travelerCta: "I'm a traveler — find a stay",
    demoLabel: "One sentence, four languages",
    demoMic: "Host speaks",
    howTitle: "How it works",
    steps: [
      { title: "Host speaks", text: "A host describes the house by voice in Kazakh or Russian. 60 seconds." },
      { title: "You scan the QR", text: "AI builds the listing in 4 languages. You see it in yours and write in yours." },
      { title: "Answer comes back", text: "The host gets WhatsApp in Russian and taps one button. You read the reply in your language." },
    ],
    catalogTitle: "Already on Qonaq",
    catalogSub: "See how a house page looks through a traveler's eyes.",
    houses: (n) => `${n} ${n === 1 ? "house" : "houses"}`,
    openCatalog: "Browse houses",
    footer: ["0% commission", "WhatsApp", "works offline"],
    demoNote: "Sample",
  },
  zh: {
    tagline: "哈萨克斯坦民宿",
    headline: "房东说哈萨克语，您用中文阅读。",
    sub: "预订哈萨克斯坦乡村民宿，用母语提问，回复自动翻译。零佣金，房东无需网站。",
    hostCta: "我是房东 — 60 秒创建页面",
    travelerCta: "我是游客 — 查找住宿",
    demoLabel: "一句话，四种语言",
    demoMic: "房东说话",
    howTitle: "如何使用",
    steps: [
      { title: "房东开口说", text: "房东用哈萨克语或俄语语音介绍房子，只需 60 秒。" },
      { title: "扫码查看", text: "AI 生成四种语言的房源页面。您用中文浏览、用中文留言。" },
      { title: "收到回复", text: "房东在 WhatsApp 收到俄语消息，点一下按钮回复，您看到的是中文。" },
    ],
    catalogTitle: "已上线的民宿",
    catalogSub: "从游客的角度看看房源页面。",
    houses: (n) => `${n} 家民宿`,
    openCatalog: "浏览民宿",
    footer: ["零佣金", "WhatsApp", "离线可用"],
    demoNote: "示例",
  },
};

/** One sentence, shown in four languages in the hero animation. */
export const DEMO_SENTENCES: Localized = {
  kk: "Қош келдіңіз! Шайымыз дайын, төсегіміз таза.",
  ru: "Добро пожаловать! Чай готов, постель чистая.",
  en: "Welcome! Tea is ready, the beds are clean.",
  zh: "欢迎光临！茶已备好，床铺干净整洁。",
};
