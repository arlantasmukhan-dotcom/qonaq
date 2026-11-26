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
    guestKind: { zh: "Китай", en: "иностранный гость", ru: "русскоязычный гость", kk: "казахскоязычный гость" },
    statusNew: "Ждёт ответа",
    statusAvailable: "Вы ответили: свободно",
    statusBusy: "Вы ответили: занято",
    question: "Вопрос гостя",
    noQuestion: "Гость не задал вопрос",
    wantsCar: "Гостю нужна машина до озера",
    originalLabel: "Оригинал",
    yourAnswer: "Ваш ответ",
    available: "Свободно",
    busy: "Занято",
    car: (p) => (p ? `Машина есть, ${p}` : "Машина есть"),
    orWrite: "Или напишите своими словами",
    placeholder: "Говорите или пишите по-русски или по-казахски…",
    mic: "Сказать голосом",
    micStop: "Остановить",
    micListening: "Слушаю…",
    micDenied: "Нет доступа к микрофону. Напишите текстом.",
    micUnsupported: "Голос не поддерживается в этом браузере. Напишите текстом.",
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
    errForbidden: "Ссылка недействительна. Откройте её из WhatsApp ещё раз.",
    errNetwork: "Нет связи. Повторите.",
    live: "На связи",
    offline: "Нет связи",
  },
  kk: {
    title: "Қонақтан өтінім",
    from: "Қонақ",
    dates: "Күндер",
    guests: (n) => `${n} адам`,
    nights: (n) => `${n} түн`,
    byPrice: "Бағалық тізім бойынша",
    noPrice: "Баға көрсетілмеген",
    guestKind: { zh: "Қытай", en: "шетелдік қонақ", ru: "орысша сөйлейтін қонақ", kk: "қазақша сөйлейтін қонақ" },
    statusNew: "Жауап күтуде",
    statusAvailable: "Сіз жауап бердіңіз: бос",
    statusBusy: "Сіз жауап бердіңіз: бос емес",
    question: "Қонақтың сұрағы",
    noQuestion: "Қонақ сұрақ қойған жоқ",
    wantsCar: "Қонаққа көлге баратын көлік керек",
    originalLabel: "Түпнұсқа",
    yourAnswer: "Сіздің жауабыңыз",
    available: "Бос",
    busy: "Бос емес",
    car: (p) => (p ? `Көлік бар, ${p}` : "Көлік бар"),
    orWrite: "Немесе өз сөзіңізбен жазыңыз",
    placeholder: "Қазақша немесе орысша айтыңыз не жазыңыз…",
    mic: "Дауыспен айту",
    micStop: "Тоқтату",
    micListening: "Тыңдап тұрмын…",
    micDenied: "Микрофонға рұқсат жоқ. Мәтінмен жазыңыз.",
    micUnsupported: "Бұл браузер дауысты қолдамайды. Мәтінмен жазыңыз.",
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
    errAi: "Аудару мүмкін болмады. Қайталаңыз немесе түймемен жауап беріңіз.",
    errForbidden: "Сілтеме жарамсыз. WhatsApp-тан қайта ашыңыз.",
    errNetwork: "Байланыс жоқ. Қайталаңыз.",
    live: "Байланыста",
    offline: "Байланыс жоқ",
  },
};
