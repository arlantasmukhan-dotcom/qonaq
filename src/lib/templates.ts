import type { Lang, Localized } from "./types";
import { formatKzt } from "./currency";

/** Host quick replies: fixed text in four languages, so the tap is instant and never fails. */
export function quickReply(
  action: "available" | "busy" | "car",
  p: { dateFrom: string; dateTo: string; carPriceKzt?: number | null },
): Localized {
  const d = (lang: Lang) => formatRange(p.dateFrom, p.dateTo, lang);
  if (action === "available") {
    return {
      kk: `Сәлеметсіз бе! ${d("kk")} бос орын бар. Сізді күтеміз.`,
      ru: `Здравствуйте! На ${d("ru")} есть свободное место. Ждём вас.`,
      en: `Hello! We have a free room for ${d("en")}. We look forward to your visit.`,
      zh: `您好！${d("zh")}有空房，期待您的到来。`,
    };
  }
  if (action === "busy") {
    return {
      kk: `Кешіріңіз, ${d("kk")} бос орын жоқ.`,
      ru: `Извините, на ${d("ru")} мест нет.`,
      en: `Sorry, we are fully booked for ${d("en")}.`,
      zh: `抱歉，${d("zh")}已满房。`,
    };
  }
  const price = p.carPriceKzt ? formatKzt(p.carPriceKzt) : null;
  const zhPrice = p.carPriceKzt ? `${p.carPriceKzt.toLocaleString("en-US")}坚戈` : null;
  return {
    kk: price ? `Қолсай көліне көлік бар — ${price}.` : "Қолсай көліне көлік бар.",
    ru: price ? `Машина до озера Кольсай есть — ${price}.` : "Машина до озера Кольсай есть.",
    en: price ? `We can drive you to Kolsai Lakes — ${price}.` : "We can drive you to Kolsai Lakes.",
    zh: zhPrice ? `可以安排车去科尔赛湖，${zhPrice}。` : "可以安排车去科尔赛湖。",
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
    return fm === tm ? `${MONTHS.kk[fm - 1]} ${fd}–${td}` : `${MONTHS.kk[fm - 1]} ${fd} – ${MONTHS.kk[tm - 1]} ${td}`;
  return fm === tm ? `${fd}–${td} ${MONTHS.ru[fm - 1]}` : `${fd} ${MONTHS.ru[fm - 1]} – ${td} ${MONTHS.ru[tm - 1]}`;
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
