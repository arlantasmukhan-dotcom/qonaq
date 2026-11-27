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
  demoText: string;
  heroPhotoAlt: string;
  heroPhotoPlace: string;
  placesTitle: string;
  placesSub: string;
  places: Record<PlaceId, string>;
}

export type PlaceId = "kolsai" | "kaindy" | "charyn" | "dune" | "torysh";

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
    sub: "Хозяин минуту рассказывает о доме голосом, а ИИ делает страницу на 4 языках и QR-код. Без комиссии и без своего сайта.",
    hostCta: "Я хозяин — создать страницу за 60 секунд",
    travelerCta: "Я турист — найти жильё",
    demoLabel: "Одна фраза — четыре языка",
    demoMic: "Хозяин говорит",
    howTitle: "Как это работает",
    steps: [
      { title: "Расскажите", text: "Опишите дом голосом на казахском или русском. Это займёт 60 секунд." },
      { title: "Получите QR-код", text: "ИИ сделает карточку на 4 языках. Повесьте QR-код у ворот или отправьте ссылку в WhatsApp." },
      { title: "Отвечайте кнопкой", text: "Заявка приходит в WhatsApp по-русски. Нажмите «Свободно» — турист прочтёт ответ на своём языке." },
    ],
    catalogTitle: "Уже на Qonaq",
    catalogSub: "Посмотрите, как выглядит страница глазами туриста.",
    houses: ruHouses,
    openCatalog: "Смотреть дома",
    footer: ["0% комиссии", "WhatsApp", "работает без интернета"],
    demoNote: "Пример",
    demoText: "Хозяин говорит по-казахски или по-русски. Гость сразу читает на своём языке: китайском, английском или русском.",
    heroPhotoAlt: "Белые меловые склоны и скалы Бозжыры на закате",
    heroPhotoPlace: "Бозжыра, Мангистау",
    placesTitle: "Куда едут гости",
    placesSub: "Сельские дома стоят рядом с местами, ради которых едут в Казахстан.",
    places: { kolsai: "Кольсайские озёра", kaindy: "Озеро Каинды", charyn: "Чарынский каньон", dune: "Поющий бархан", torysh: "Долина шаров Торыш" },
  },
  kk: {
    tagline: "Қазақстанның қонақ үйлері",
    headline: "Қазақша сөйлеңіз. Қонақ өз тілінде оқиды.",
    sub: "Үйіңіз туралы бір минут айтып бересіз, ал ЖИ 4 тілде бет пен QR-код жасайды. Комиссиясыз, сайтсыз.",
    hostCta: "Мен үй иесімін — 60 секундта бет жасау",
    travelerCta: "Мен туристпін — қонатын жер табу",
    demoLabel: "Бір сөйлем — төрт тіл",
    demoMic: "Үй иесі айтады",
    howTitle: "Қалай жұмыс істейді",
    steps: [
      { title: "Айтып беріңіз", text: "Үйіңіз туралы қазақша немесе орысша дауыспен айтыңыз. Бар болғаны 60 секунд." },
      { title: "QR-код алыңыз", text: "ЖИ 4 тілде карточка жасайды. QR-кодты қақпаға іліп қойыңыз немесе сілтемені WhatsApp арқылы жіберіңіз." },
      { title: "Түймемен жауап беріңіз", text: "Өтінім WhatsApp-қа орысша келеді. «Бос» түймесін басасыз — турист жауапты өз тілінде оқиды." },
    ],
    catalogTitle: "Qonaq-тағы үйлер",
    catalogSub: "Турист көзімен бет қалай көрінетінін қараңыз.",
    houses: (n) => `${n} үй`,
    openCatalog: "Үйлерді қарау",
    footer: ["0% комиссия", "WhatsApp", "интернетсіз жұмыс істейді"],
    demoNote: "Мысал",
    demoText: "Үй иесі қазақша немесе орысша сөйлейді. Қонақ бірден өз тілінде оқиды: қытайша, ағылшынша немесе орысша.",
    heroPhotoAlt: "Күн батқандағы Бозжыраның ақ бор беткейлері мен жартастары",
    heroPhotoPlace: "Бозжыра, Маңғыстау",
    placesTitle: "Қонақтар қайда барады",
    placesSub: "Ауылдағы үйлер Қазақстанға адамдар әдейі келетін жерлердің жанында.",
    places: { kolsai: "Көлсай көлдері", kaindy: "Қайыңды көлі", charyn: "Шарын шатқалы", dune: "Әнші құм", torysh: "Торыш шарлар аңғары" },
  },
  en: {
    tagline: "Guesthouses of Kazakhstan",
    headline: "Your host speaks Kazakh. You read it in your language.",
    sub: "Book rural guesthouses in Kazakhstan, ask questions in your own language and get replies translated. No commission, and hosts don't need a website.",
    hostCta: "I'm a host — create a page in 60 seconds",
    travelerCta: "I'm a traveler — find a stay",
    demoLabel: "One sentence, four languages",
    demoMic: "Host speaks",
    howTitle: "How it works",
    steps: [
      { title: "The host speaks", text: "The host describes their guesthouse by voice in Kazakh or Russian. It takes 60 seconds." },
      { title: "You scan the QR code", text: "AI turns it into a listing in 4 languages. You read it and message the host in your own language." },
      { title: "The reply comes back", text: "The host gets your request on WhatsApp in Russian and replies with one tap. You read the answer in your language." },
    ],
    catalogTitle: "Already on Qonaq",
    catalogSub: "See what a guesthouse page looks like to a traveler.",
    houses: (n) => `${n} ${n === 1 ? "guesthouse" : "guesthouses"}`,
    openCatalog: "Browse guesthouses",
    footer: ["0% commission", "WhatsApp", "works offline"],
    demoNote: "Sample",
    demoText: "The host speaks Kazakh or Russian. You read it right away in Chinese, English or Russian.",
    heroPhotoAlt: "White chalk slopes and rock towers of Bozzhyra at sunset",
    heroPhotoPlace: "Bozzhyra, Mangystau",
    placesTitle: "Where guests go",
    placesSub: "Village guesthouses sit close to the places people travel to Kazakhstan for.",
    places: { kolsai: "Kolsai Lakes", kaindy: "Lake Kaindy", charyn: "Charyn Canyon", dune: "Singing Dune", torysh: "Torysh, valley of stone balls" },
  },
  zh: {
    tagline: "哈萨克斯坦民宿",
    headline: "房东说哈萨克语，您看到的是中文。",
    sub: "预订哈萨克斯坦乡村民宿，用母语提问，回复自动翻译。零佣金，房东无需网站。",
    hostCta: "我是房东 · 60 秒创建民宿页面",
    travelerCta: "我是游客 · 查找民宿",
    demoLabel: "一句话，四种语言",
    demoMic: "房东语音",
    howTitle: "如何使用",
    steps: [
      { title: "房东语音介绍", text: "房东用哈萨克语或俄语语音介绍自家民宿，只需 60 秒。" },
      { title: "扫码查看", text: "AI 生成四种语言的房源页面，您可以用中文浏览和留言。" },
      { title: "收到回复", text: "房东在 WhatsApp 上收到俄语消息，一键回复，您看到的是中文翻译。" },
    ],
    catalogTitle: "已上线的民宿",
    catalogSub: "看看游客眼中的民宿页面。",
    houses: (n) => `${n} 家民宿`,
    openCatalog: "浏览民宿",
    footer: ["零佣金", "WhatsApp", "离线可用"],
    demoNote: "示例",
    demoText: "房东说哈萨克语或俄语，您立即就能用中文、英语或俄语阅读。",
    heroPhotoAlt: "日落时博兹日拉的白色白垩山坡和岩柱",
    heroPhotoPlace: "博兹日拉，曼格斯套",
    placesTitle: "游客去哪里",
    placesSub: "乡村民宿就在人们专程前往哈萨克斯坦的景点附近。",
    places: { kolsai: "科尔赛湖", kaindy: "凯音迪湖", charyn: "恰伦峡谷", dune: "鸣沙山", torysh: "托雷什石球谷" },
  },
};

/** One sentence, shown in four languages in the hero animation. */
export const DEMO_SENTENCES: Localized = {
  kk: "Қош келдіңіз! Шай дайын, төсек-орын таза.",
  ru: "Добро пожаловать! Чай готов, постель чистая.",
  en: "Welcome! The tea is ready and the beds are fresh.",
  zh: "欢迎！茶已备好，床铺干净整洁。",
};
