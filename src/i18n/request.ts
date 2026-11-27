import type { Lang } from "@/lib/types";

/** Host-facing strings of the request page: Russian and Kazakh only. */
export interface HostStrings {
  title: string;
  from: string;
  dates: string;
  guests: (n: number) => string;
  nights: (n: number) => string;
  byPrice: string;
  noPrice: string;
  guestKind: Record<Lang, string>;
  statusNew: string;
  statusAvailable: string;
  statusBusy: string;
  question: string;
  noQuestion: string;
  wantsCar: string;
  originalLabel: string;
  yourAnswer: string;
  available: string;
  busy: string;
  car: (price: string | null) => string;
  orWrite: string;
  placeholder: string;
  mic: string;
  micStop: string;
  micListening: string;
  micDenied: string;
  micUnsupported: string;
  sendText: string;
  sending: string;
  guestWillSee: (langPrep: string) => string;
  langPrep: Record<Lang, string>;
  copy: string;
  copied: string;
  thread: string;
  youLabel: string;
  guestLabel: string;
  errNoKey: string;
  errAi: string;
  errForbidden: string;
  errNetwork: string;
  live: string;
  offline: string;
}

function ruPlural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

export const HOST: Record<"ru" | "kk", HostStrings> = {
  ru: {
    title: "Заявка от гостя",
    from: "Гость",
    dates: "Даты",
    guests: (n) => `${n} ${ruPlural(n, "человек", "человека", "человек")}`,
    nights: (n) => `${n} ${ruPlural(n, "ночь", "ночи", "ночей")}`,
    byPrice: "По прайсу",
    noPrice: "Цена не указана",
    guestKind: { zh: "гость из Китая", en: "иностранный гость", ru: "русскоязычный гость", kk: "казахскоязычный гость" },
    statusNew: "Ждёт ответа",
    statusAvailable: "Вы ответили: свободно",
    statusBusy: "Вы ответили: занято",
    question: "Вопрос гостя",
    noQuestion: "Вопросов у гостя нет",
    wantsCar: "Гостю нужна машина",
    originalLabel: "Оригинал",
    yourAnswer: "Ваш ответ",
    available: "Свободно",
    busy: "Занято",
    car: (p) => (p ? `Машина есть, ${p}` : "Машина есть"),
    orWrite: "Или напишите своими словами",
    placeholder: "Скажите или напишите по-русски или по-казахски…",
    mic: "Ответить голосом",
    micStop: "Остановить",
    micListening: "Слушаю…",
    micDenied: "Нет доступа к микрофону. Напишите текстом.",
    micUnsupported: "Этот браузер не поддерживает голосовой ввод. Напишите текстом.",
    sendText: "Отправить ответ",
    sending: "Отправляем…",
    guestWillSee: (l) => `Гость увидит ответ на ${l}:`,
    langPrep: { zh: "китайском", en: "английском", ru: "русском", kk: "казахском" },
    copy: "Скопировать перевод",
    copied: "Скопировано",
    thread: "Переписка",
    youLabel: "Вы",
    guestLabel: "Гость",
    errNoKey: "Перевод пока недоступен. Ответьте кнопками.",
    errAi: "Не удалось перевести. Повторите или ответьте кнопкой.",
    errForbidden: "Ссылка не работает. Откройте её ещё раз из WhatsApp.",
    errNetwork: "Нет связи. Попробуйте ещё раз.",
    live: "На связи",
    offline: "Нет связи",
  },
  kk: {
    title: "Қонақтың өтінімі",
    from: "Қонақ",
    dates: "Күндер",
    guests: (n) => `${n} адам`,
    nights: (n) => `${n} түн`,
    byPrice: "Баға тізімі бойынша",
    noPrice: "Баға көрсетілмеген",
    guestKind: { zh: "Қытайдан келген қонақ", en: "шетелдік қонақ", ru: "орыс тілді қонақ", kk: "қазақ тілді қонақ" },
    statusNew: "Жауап күтуде",
    statusAvailable: "Сіз жауап бердіңіз: бос",
    statusBusy: "Сіз жауап бердіңіз: бос емес",
    question: "Қонақтың сұрағы",
    noQuestion: "Қонақ сұрақ қойған жоқ",
    wantsCar: "Қонаққа көлік керек",
    originalLabel: "Түпнұсқа",
    yourAnswer: "Сіздің жауабыңыз",
    available: "Бос",
    busy: "Бос емес",
    car: (p) => (p ? `Көлік бар, ${p}` : "Көлік бар"),
    orWrite: "Немесе өз сөзіңізбен жазыңыз",
    placeholder: "Қазақша немесе орысша айтыңыз не жазыңыз…",
    mic: "Дауыспен жауап беру",
    micStop: "Тоқтату",
    micListening: "Тыңдап тұрмын…",
    micDenied: "Микрофонға рұқсат жоқ. Мәтінмен жазыңыз.",
    micUnsupported: "Бұл браузерде дауыспен енгізу жоқ. Мәтінмен жазыңыз.",
    sendText: "Жауап жіберу",
    sending: "Жіберілуде…",
    guestWillSee: (l) => `Қонақ жауапты ${l} көреді:`,
    langPrep: { zh: "қытай тілінде", en: "ағылшын тілінде", ru: "орыс тілінде", kk: "қазақ тілінде" },
    copy: "Аударманы көшіру",
    copied: "Көшірілді",
    thread: "Хат алмасу",
    youLabel: "Сіз",
    guestLabel: "Қонақ",
    errNoKey: "Аударма әзірге қолжетімсіз. Түймелермен жауап беріңіз.",
    errAi: "Аудару мүмкін болмады. Қайталап көріңіз немесе түймемен жауап беріңіз.",
    errForbidden: "Сілтеме жарамсыз. Оны WhatsApp-тан қайта ашыңыз.",
    errNetwork: "Байланыс жоқ. Қайталап көріңіз.",
    live: "Байланыста",
    offline: "Байланыс жоқ",
  },
};
