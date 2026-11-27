import type { Lang, Localized } from "./types";
import { formatKzt } from "./currency";

/** Host quick replies: fixed text in four languages, so the tap is instant and never fails. */
export function quickReply(
  action: "available" | "busy" | "car",
  p: { dateFrom: string; dateTo: string; car?: CarService },
): Localized {
  const d = (lang: Lang) => formatRange(p.dateFrom, p.dateTo, lang);
  if (action === "available") {
    return {
      kk: `Сәлеметсіз бе! ${d("kk")} аралығында бос орын бар. Сізді күтеміз!`,
      ru: `Здравствуйте! На ${d("ru")} есть свободные места. Ждём вас!`,
      en: `Hello! We have a room available for ${d("en")}. Looking forward to having you!`,
      zh: `您好！${d("zh")}有空房，期待您的到来。`,
    };
  }
  if (action === "busy") {
    return {
      kk: `Кешіріңіз, ${d("kk")} аралығында бос орын жоқ.`,
      ru: `Извините, на ${d("ru")} мест нет.`,
      en: `Sorry, we're fully booked for ${d("en")}.`,
      zh: `抱歉，${d("zh")}已满房。`,
    };
  }
  // The car text quotes the host's own car service ("Машина до озера Каинды"), so it never names
  // a place the house does not drive to.
  const price = p.car?.priceKzt ? formatKzt(p.car.priceKzt) : null;
  const zhPrice = p.car?.priceKzt ? `${p.car.priceKzt.toLocaleString("en-US")}坚戈` : null;
  const n = carName(p.car);
  const tail = (sep: string, v: string | null) => (v ? `${sep}${v}` : "");
  if (n) {
    return {
      kk: `Иә, «${n.kk}» ұйымдастырамыз${tail(" — ", price)}.`,
      ru: `Да, «${n.ru}» можем организовать${tail(" — ", price)}.`,
      en: `Yes, we can arrange "${n.en}"${tail(" — ", price)}.`,
      zh: `可以安排「${n.zh}」${tail("，", zhPrice)}。`,
    };
  }
  return {
    kk: `Көлік бар, апарып тастаймыз${tail(" — ", price)}.`,
    ru: `Машина есть, можем отвезти${tail(" — ", price)}.`,
    en: `We have a car and can drive you${tail(" — ", price)}.`,
    zh: `我们有车，可以接送您${tail("，", zhPrice)}。`,
  };
}

export type CarService = { priceKzt: number | null; name: Localized } | null | undefined;

/** The car service's name in all four languages, or null when any is missing. */
function carName(car: CarService): Localized | null {
  const n = car?.name;
  return n && n.kk?.trim() && n.ru?.trim() && n.en?.trim() && n.zh?.trim() ? n : null;
}

/** The ready-made car question, used when the guest ticks the car box without writing anything. */
export function carQuestion(car: CarService): Localized {
  const n = carName(car);
  if (n) {
    return {
      kk: `«${n.kk}» қызметін алғымыз келеді. Бола ма?`,
      ru: `Хотим заказать «${n.ru}». Это возможно?`,
      en: `We'd like "${n.en}". Is that possible?`,
      zh: `我们想预订「${n.zh}」，可以吗？`,
    };
  }
  return {
    kk: "Көлік ұйымдастыра аласыз ба?",
    ru: "Можете организовать машину?",
    en: "Can you arrange a car?",
    zh: "可以帮我们安排车吗？",
  };
}

const MONTHS: Record<Lang, string[]> = {
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  kk: ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  zh: [],
};

/** "12–14 июля", "July 12–14" style date range in the given language. */
export function formatRange(from: string, to: string, lang: Lang): string {
  const [, fm, fd] = from.split("-").map(Number);
  const [, tm, td] = to.split("-").map(Number);
  if (lang === "zh") return fm === tm ? `${fm}月${fd}日至${td}日` : `${fm}月${fd}日至${tm}月${td}日`;
  if (lang === "en")
    return fm === tm ? `${MONTHS.en[fm - 1]} ${fd}–${td}` : `${MONTHS.en[fm - 1]} ${fd} – ${MONTHS.en[tm - 1]} ${td}`;
  if (lang === "kk")
    return fm === tm ? `${fd}–${td} ${MONTHS.kk[fm - 1]}` : `${fd} ${MONTHS.kk[fm - 1]} – ${td} ${MONTHS.kk[tm - 1]}`;
  return fm === tm ? `${fd}–${td} ${MONTHS.ru[fm - 1]}` : `${fd} ${MONTHS.ru[fm - 1]} – ${td} ${MONTHS.ru[tm - 1]}`;
}

/** True for a real calendar day in YYYY-MM-DD ("2027-02-30" is not: Date.parse would roll it into March). */
export function isRealDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function nightsBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

const COUNTRY_BY_LANG: Record<Lang, string> = { zh: "Китай", en: "иностранец", ru: "", kk: "" };

/** The Russian message the guest sends to the host through wa.me. */
export function whatsappMessage(p: {
  hostName: string;
  guestName: string;
  guestLang: Lang;
  guests: number;
  dateFrom: string;
  dateTo: string;
  nights: number;
  totalKzt: number | null;
  questionRu: string | null;
  replyUrl: string;
}): string {
  const country = COUNTRY_BY_LANG[p.guestLang];
  const lines = [
    `Здравствуйте, ${p.hostName}! Заявка через Qonaq.`,
    `Гость: ${p.guestName}${country ? ` (${country})` : ""}, ${p.guests} ${plural(p.guests, "человек", "человека", "человек")}`,
    `Даты: ${formatRange(p.dateFrom, p.dateTo, "ru")} (${p.nights} ${plural(p.nights, "ночь", "ночи", "ночей")})${
      p.totalKzt ? `, по прайсу ${formatKzt(p.totalKzt)}` : ""
    }`,
  ];
  if (p.questionRu) lines.push(`Вопрос: ${p.questionRu}`);
  lines.push(`Ответить гостю на его языке: ${p.replyUrl}`);
  return lines.join("\n");
}

/**
 * The Russian WhatsApp note a guest sends when they add a message after the first request.
 * No reply key in it (the sender may not be the guest): the host answers from the dashboard
 * or from the reply link in the first request message.
 */
export function followUpMessage(p: { guestName: string; code: string; textRu: string; dashboardUrl: string }): string {
  return [
    `Новое сообщение от гостя ${p.guestName} (заявка ${p.code} через Qonaq):`,
    p.textRu,
    `Ответить можно по ссылке из первой заявки или в вашем кабинете: ${p.dashboardUrl}`,
  ].join("\n");
}

export function waLink(phoneDigits: string, text: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
