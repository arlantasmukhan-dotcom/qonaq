import type { Lang, Localized } from "@/lib/types";

/** Everything the tourist reads: catalog, house page, driver card, and guest mode of the request page. */
export interface TouristStrings {
  back: string;
  // catalog
  housesCount: (n: number) => string;
  fromPrice: string;
  perNight: string;
  rooms: (n: number) => string;
  example: string;
  // house
  priceTitle: string;
  rateAsOf: (date: string) => string;
  forGuests: (n: number) => string;
  breakfast: string;
  checkIn: string;
  host: string;
  about: string;
  extras: string;
  rules: string;
  offlineBadge: string;
  showDriver: string;
  showDriverSub: string;
  // booking form
  bookTitle: string;
  dateFrom: string;
  dateTo: string;
  guestsLabel: string;
  guestsCount: (n: number) => string;
  fewer: string;
  more: string;
  nameLabel: string;
  namePlaceholder: string;
  carToggle: (price: string | null) => string;
  questionLabel: string;
  questionPlaceholder: string;
  nights: (n: number) => string;
  roomsMult: (n: number) => string;
  totalNote: string;
  writeToHost: string;
  sendWithoutWa: string;
  sending: string;
  waHint: string;
  errName: string;
  errDates: string;
  errRate: string;
  errNoKey: string;
  errAi: string;
  errNetwork: string;
  retryWithoutQuestion: string;
  // request page, guest mode
  reqTitle: string;
  waiting: (host: string) => string;
  waitingSub: string;
  availableTitle: (host: string) => string;
  busyTitle: (host: string) => string;
  busySub: string;
  availableSub: string;
  live: string;
  summary: string;
  dates: string;
  total: string;
  thread: string;
  youLabel: string;
  hostLabel: (host: string) => string;
  original: string;
  hideOriginal: string;
  followUp: string;
  followUpPlaceholder: string;
  send: string;
  sendingMsg: string;
  openWa: string;
  openWaSub: string;
  viewHouse: string;
  msgError: string;
  yourQuestion: string;
  translatedNote: string;
  // driver card
  driverTitle: string;
  driverExplain: string;
  driverTake: string;
  callHost: string;
  open2gis: string;
  openGoogle: string;
  driverRules: string;
  telShort: string;
}

function ruPlural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

export const TOURIST: Record<Lang, TouristStrings> = {
  en: {
    back: "Back",
    housesCount: (n) => `${n} ${n === 1 ? "guesthouse" : "guesthouses"} to choose from`,
    fromPrice: "per night",
    perNight: "per night",
    rooms: (n) => `${n} ${n === 1 ? "room" : "rooms"}`,
    example: "Example listing",
    priceTitle: "Price",
    rateAsOf: (d) => `Approximate rate as of ${d}. You pay the host in tenge.`,
    forGuests: (n) => `for up to ${n} ${n === 1 ? "guest" : "guests"}`,
    breakfast: "Breakfast included",
    checkIn: "Check-in",
    host: "Your host",
    about: "About this place",
    extras: "Extras",
    rules: "House rules",
    offlineBadge: "Saved for offline",
    showDriver: "Show to the driver",
    showDriverSub: "Works offline, in Kazakh and Russian",
    bookTitle: "Ask the host",
    dateFrom: "Check-in",
    dateTo: "Check-out",
    guestsLabel: "Guests",
    guestsCount: (n) => `${n} ${n === 1 ? "guest" : "guests"}`,
    fewer: "Fewer guests",
    more: "More guests",
    nameLabel: "Your name",
    namePlaceholder: "e.g. Li Wei",
    carToggle: (p) => (p ? `I need a car to the lake (${p})` : "I need a car to the lake"),
    questionLabel: "Your question (optional)",
    questionPlaceholder: "Write in English. The host will read it in Russian.",
    nights: (n) => `${n} ${n === 1 ? "night" : "nights"}`,
    roomsMult: (n) => `${n} rooms`,
    totalNote: "Estimate by price list",
    writeToHost: "Write to host",
    sendWithoutWa: "Send request without WhatsApp",
    sending: "Sending…",
    waHint: "WhatsApp opens with a ready message in Russian. The answer will appear here in English.",
    errName: "Please enter your name.",
    errDates: "Check-out must be after check-in.",
    errRate: "Too many requests. Please wait a minute and try again.",
    errNoKey: "Translation is not available right now, so your question could not be sent.",
    errAi: "We could not translate your question. Please try again.",
    errNetwork: "No connection. Check your internet and try again.",
    retryWithoutQuestion: "Send without the question",
    reqTitle: "Your request",
    waiting: (h) => `${h} received your request on WhatsApp…`,
    waitingSub: "Usually the host answers within a few hours. This page updates by itself.",
    availableTitle: (h) => `${h} answered: available`,
    busyTitle: (h) => `${h} answered: not available`,
    availableSub: "Great news. Confirm the details with the host on WhatsApp.",
    busySub: "Try other dates or another house in the village.",
    live: "Live",
    summary: "Your request",
    dates: "Dates",
    total: "Estimated total",
    thread: "Messages",
    youLabel: "You",
    hostLabel: (h) => h,
    original: "Original",
    hideOriginal: "Hide original",
    followUp: "Add a message",
    followUpPlaceholder: "Write in English…",
    send: "Send",
    sendingMsg: "Sending…",
    openWa: "Open WhatsApp",
    openWaSub: "Send your request to the host",
    viewHouse: "Back to the house",
    msgError: "Could not send. Try again.",
    yourQuestion: "Your question",
    translatedNote: "Translated automatically",
    driverTitle: "Show this screen to your driver",
    driverExplain: "Show this screen to your driver or any local. It works without internet.",
    driverTake: "Please take me here.",
    callHost: "Call the host",
    open2gis: "Open in 2GIS",
    openGoogle: "Open in Google Maps",
    driverRules: "House rules",
    telShort: "Tel.",
  },
  zh: {
    back: "返回",
    housesCount: (n) => `共 ${n} 家民宿可选`,
    fromPrice: "每晚",
    perNight: "每晚",
    rooms: (n) => `${n}间客房`,
    example: "示例房源",
    priceTitle: "价格",
    rateAsOf: (d) => `汇率为 ${d} 的参考汇率，到店向房东支付坚戈。`,
    forGuests: (n) => `最多 ${n} 位客人`,
    breakfast: "含早餐",
    checkIn: "入住时间",
    host: "您的房东",
    about: "房源介绍",
    extras: "额外服务",
    rules: "入住须知",
    offlineBadge: "已保存，可离线查看",
    showDriver: "给司机看",
    showDriverSub: "无需网络，哈萨克语和俄语",
    bookTitle: "联系房东",
    dateFrom: "入住日期",
    dateTo: "退房日期",
    guestsLabel: "入住人数",
    guestsCount: (n) => `${n}位客人`,
    fewer: "减少人数",
    more: "增加人数",
    nameLabel: "您的姓名",
    namePlaceholder: "例如：李伟",
    carToggle: (p) => (p ? `我需要去湖边的车（${p}）` : "我需要去湖边的车"),
    questionLabel: "想问房东的问题（选填）",
    questionPlaceholder: "请用中文提问，房东会收到俄语翻译。",
    nights: (n) => `${n}晚`,
    roomsMult: (n) => `${n}间`,
    totalNote: "按价目表估算",
    writeToHost: "联系房东",
    sendWithoutWa: "仅发送申请，不打开 WhatsApp",
    sending: "正在发送…",
    waHint: "将打开 WhatsApp，并附上俄语消息。房东的回复会翻译成中文显示在这里。",
    errName: "请填写您的姓名。",
    errDates: "退房日期必须晚于入住日期。",
    errRate: "请求过于频繁，请稍等一分钟再试。",
    errNoKey: "翻译功能暂时不可用，问题无法发送。",
    errAi: "问题翻译失败，请重试。",
    errNetwork: "网络未连接，请检查网络后重试。",
    retryWithoutQuestion: "不带问题直接发送",
    reqTitle: "您的申请",
    waiting: (h) => `${h}已在 WhatsApp 收到您的申请…`,
    waitingSub: "房东通常会在几小时内回复。本页面会自动更新。",
    availableTitle: (h) => `${h}回复：有空房`,
    busyTitle: (h) => `${h}回复：已满房`,
    availableSub: "好消息！请在 WhatsApp 上与房东确认细节。",
    busySub: "可以换个日期，或看看村里的其他民宿。",
    live: "实时",
    summary: "申请详情",
    dates: "日期",
    total: "预计总价",
    thread: "消息",
    youLabel: "我",
    hostLabel: (h) => h,
    original: "查看原文",
    hideOriginal: "收起原文",
    followUp: "补充留言",
    followUpPlaceholder: "请用中文留言…",
    send: "发送",
    sendingMsg: "发送中…",
    openWa: "打开 WhatsApp",
    openWaSub: "把申请发给房东",
    viewHouse: "返回房源",
    msgError: "发送失败，请重试。",
    yourQuestion: "您的问题",
    translatedNote: "自动翻译",
    driverTitle: "请把此页面给司机看",
    driverExplain: "请把此页面出示给司机或当地人，无需网络也能打开。",
    driverTake: "请带我去这里。",
    callHost: "致电房东",
    open2gis: "在 2GIS 中打开",
    openGoogle: "在谷歌地图中打开",
    driverRules: "入住须知",
    telShort: "电话",
  },
  ru: {
    back: "Назад",
    housesCount: (n) => `${n} ${ruPlural(n, "дом", "дома", "домов")} на выбор`,
    fromPrice: "за ночь",
    perNight: "за ночь",
    rooms: (n) => `${n} ${ruPlural(n, "комната", "комнаты", "комнат")}`,
    example: "Пример дома",
    priceTitle: "Цена",
    rateAsOf: (d) => `Ориентировочный курс на ${d}. Платить хозяину нужно в тенге.`,
    forGuests: (n) => `до ${n} ${ruPlural(n, "гостя", "гостей", "гостей")}`,
    breakfast: "Завтрак включён",
    checkIn: "Заезд",
    host: "Ваш хозяин",
    about: "О доме",
    extras: "Дополнительно",
    rules: "Правила дома",
    offlineBadge: "Сохранено для офлайна",
    showDriver: "Показать водителю",
    showDriverSub: "Работает без интернета, на казахском и русском",
    bookTitle: "Написать хозяину",
    dateFrom: "Заезд",
    dateTo: "Выезд",
    guestsLabel: "Гостей",
    guestsCount: (n) => `${n} ${ruPlural(n, "гость", "гостя", "гостей")}`,
    fewer: "Меньше гостей",
    more: "Больше гостей",
    nameLabel: "Ваше имя",
    namePlaceholder: "Например, Анна",
    carToggle: (p) => (p ? `Нужна машина до озера (${p})` : "Нужна машина до озера"),
    questionLabel: "Ваш вопрос (необязательно)",
    questionPlaceholder: "Напишите на русском. Хозяин получит перевод.",
    nights: (n) => `${n} ${ruPlural(n, "ночь", "ночи", "ночей")}`,
    roomsMult: (n) => `${n} ${ruPlural(n, "комната", "комнаты", "комнат")}`,
    totalNote: "Оценка по прайсу",
    writeToHost: "Написать хозяину",
    sendWithoutWa: "Отправить заявку без WhatsApp",
    sending: "Отправляем…",
    waHint: "Откроется WhatsApp с готовым сообщением. Ответ хозяина появится здесь.",
    errName: "Укажите ваше имя.",
    errDates: "Выезд должен быть позже заезда.",
    errRate: "Слишком много заявок. Подождите минуту и повторите.",
    errNoKey: "Перевод сейчас недоступен, вопрос отправить не получится.",
    errAi: "Не удалось перевести вопрос. Попробуйте ещё раз.",
    errNetwork: "Нет связи. Проверьте интернет и повторите.",
    retryWithoutQuestion: "Отправить без вопроса",
    reqTitle: "Ваша заявка",
    waiting: (h) => `${h} получил вашу заявку в WhatsApp…`,
    waitingSub: "Обычно хозяин отвечает в течение нескольких часов. Страница обновляется сама.",
    availableTitle: (h) => `${h} ответил: свободно`,
    busyTitle: (h) => `${h} ответил: занято`,
    availableSub: "Отличные новости. Уточните детали с хозяином в WhatsApp.",
    busySub: "Попробуйте другие даты или другой дом в селе.",
    live: "Онлайн",
    summary: "Заявка",
    dates: "Даты",
    total: "Ориентировочная сумма",
    thread: "Сообщения",
    youLabel: "Вы",
    hostLabel: (h) => h,
    original: "Оригинал",
    hideOriginal: "Скрыть оригинал",
    followUp: "Дописать сообщение",
    followUpPlaceholder: "Напишите сообщение…",
    send: "Отправить",
    sendingMsg: "Отправляем…",
    openWa: "Открыть WhatsApp",
    openWaSub: "Отправьте заявку хозяину",
    viewHouse: "Назад к дому",
    msgError: "Не удалось отправить. Повторите.",
    yourQuestion: "Ваш вопрос",
    translatedNote: "Переведено автоматически",
    driverTitle: "Покажите этот экран водителю",
    driverExplain: "Покажите этот экран водителю или местному жителю. Работает без интернета.",
    driverTake: "Пожалуйста, отвезите меня сюда.",
    callHost: "Позвонить хозяину",
    open2gis: "Открыть в 2ГИС",
    openGoogle: "Открыть в Google Картах",
    driverRules: "Правила дома",
    telShort: "Тел.",
  },
  kk: {
    back: "Артқа",
    housesCount: (n) => `Таңдауға ${n} қонақ үй`,
    fromPrice: "бір түнге",
    perNight: "бір түнге",
    rooms: (n) => `${n} бөлме`,
    example: "Үлгі үй",
    priceTitle: "Бағасы",
    rateAsOf: (d) => `${d} күнгі шамамен алынған бағам. Үй иесіне теңгемен төлейсіз.`,
    forGuests: (n) => `${n} қонаққа дейін`,
    breakfast: "Таңғы ас бағаға кіреді",
    checkIn: "Кіру уақыты",
    host: "Үй иесі",
    about: "Үй туралы",
    extras: "Қосымша қызметтер",
    rules: "Үй ережелері",
    offlineBadge: "Офлайн үшін сақталды",
    showDriver: "Жүргізушіге көрсету",
    showDriverSub: "Интернетсіз істейді, қазақша және орысша",
    bookTitle: "Үй иесіне жазу",
    dateFrom: "Келу күні",
    dateTo: "Кету күні",
    guestsLabel: "Қонақ саны",
    guestsCount: (n) => `${n} қонақ`,
    fewer: "Қонақты азайту",
    more: "Қонақты көбейту",
    nameLabel: "Атыңыз",
    namePlaceholder: "Мысалы, Айдос",
    carToggle: (p) => (p ? `Көлге баратын көлік керек (${p})` : "Көлге баратын көлік керек"),
    questionLabel: "Сұрағыңыз (міндетті емес)",
    questionPlaceholder: "Қазақша жазыңыз. Үй иесі орысша аударма алады.",
    nights: (n) => `${n} түн`,
    roomsMult: (n) => `${n} бөлме`,
    totalNote: "Бағалық тізім бойынша",
    writeToHost: "Үй иесіне жазу",
    sendWithoutWa: "WhatsApp-сыз өтінім жіберу",
    sending: "Жіберілуде…",
    waHint: "WhatsApp дайын хабарламамен ашылады. Үй иесінің жауабы осы жерде шығады.",
    errName: "Атыңызды жазыңыз.",
    errDates: "Кету күні келу күнінен кейін болуы керек.",
    errRate: "Тым көп өтінім. Бір минуттан кейін қайталаңыз.",
    errNoKey: "Аударма қазір қолжетімсіз, сұрақты жіберу мүмкін емес.",
    errAi: "Сұрақты аудару мүмкін болмады. Қайталап көріңіз.",
    errNetwork: "Байланыс жоқ. Интернетті тексеріп, қайталаңыз.",
    retryWithoutQuestion: "Сұрақсыз жіберу",
    reqTitle: "Сіздің өтініміңіз",
    waiting: (h) => `${h} өтініміңізді WhatsApp-та алды…`,
    waitingSub: "Әдетте үй иесі бірнеше сағатта жауап береді. Бет өзі жаңарады.",
    availableTitle: (h) => `${h} жауап берді: бос`,
    busyTitle: (h) => `${h} жауап берді: бос емес`,
    availableSub: "Тамаша жаңалық. Мәліметтерді WhatsApp-та нақтылаңыз.",
    busySub: "Басқа күндерді немесе ауылдағы басқа үйді қарап көріңіз.",
    live: "Тікелей",
    summary: "Өтінім",
    dates: "Күндер",
    total: "Шамамен жалпы сома",
    thread: "Хабарламалар",
    youLabel: "Сіз",
    hostLabel: (h) => h,
    original: "Түпнұсқа",
    hideOriginal: "Түпнұсқаны жасыру",
    followUp: "Хабарлама қосу",
    followUpPlaceholder: "Хабарлама жазыңыз…",
    send: "Жіберу",
    sendingMsg: "Жіберілуде…",
    openWa: "WhatsApp ашу",
    openWaSub: "Өтінімді үй иесіне жіберіңіз",
    viewHouse: "Үйге оралу",
    msgError: "Жіберілмеді. Қайталаңыз.",
    yourQuestion: "Сіздің сұрағыңыз",
    translatedNote: "Автоматты түрде аударылды",
    driverTitle: "Бұл экранды жүргізушіге көрсетіңіз",
    driverExplain: "Бұл экранды жүргізушіге немесе жергілікті тұрғынға көрсетіңіз. Интернетсіз істейді.",
    driverTake: "Мені осы жерге апарыңызшы.",
    callHost: "Үй иесіне қоңырау шалу",
    open2gis: "2ГИС-те ашу",
    openGoogle: "Google Maps-те ашу",
    driverRules: "Үй ережелері",
    telShort: "Тел.",
  },
};

/** Short per-village intro line. Only Saty is hand-written; other villages get no extra line. */
export const VILLAGE_INTRO: Record<string, Localized> = {
  saty: {
    kk: "Қолсай көлдеріне дейін 20 минут",
    ru: "20 минут до озёр Кольсай",
    en: "20 min to Kolsai Lakes",
    zh: "距科尔赛湖仅 20 分钟车程",
  },
};

export const EXTRA_ICON: Record<string, string> = {
  sauna: "♨️",
  car: "🚗",
  meal: "🍲",
  horse: "🐎",
  guide: "🧭",
  other: "✨",
};

/** "+7 700 123 45 67" for Kazakh/Russian numbers, "+<digits>" otherwise. */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("7")) {
    return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
  }
  return `+${d}`;
}

export function firstName(hostName: string): string {
  return hostName.trim().split(/\s+/)[0] ?? hostName;
}
