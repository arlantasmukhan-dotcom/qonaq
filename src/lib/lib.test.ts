import { describe, expect, it } from "vitest";
import { randomCode, slugify } from "./codes";
import { formatDual, formatIn, formatKzt } from "./currency";
import { langFromAcceptLanguage } from "./lang";
import { carQuestion, formatRange, nightsBetween, quickReply, waLink, whatsappMessage } from "./templates";

describe("codes", () => {
  it("uses only unambiguous characters", () => {
    for (let i = 0; i < 200; i++) expect(randomCode(6)).toMatch(/^[2-9A-HJKMNP-Z]{6}$/);
  });
  it("slugifies Kazakh and Russian names", () => {
    expect(slugify("Ерлан")).toBe("erlan");
    expect(slugify("Айгүл")).toBe("aigul");
    expect(slugify("Нұрлан")).toBe("nurlan");
    expect(slugify("Саты ауылы")).toBe("saty-auyly");
    expect(slugify("Бауыржан")).toBe("bauyrzhan");
  });
});

describe("currency", () => {
  it("formats tenge with non-breaking spaces", () => {
    expect(formatKzt(15000)).toBe("15 000 ₸");
  });
  it("converts to yuan like the product doc (15 000 ₸ ≈ 225 元)", () => {
    expect(formatIn(15000, "CNY")).toBe("≈ 225 元");
  });
  it("shows tenge only for Kazakh and Russian visitors", () => {
    expect(formatDual(15000, "ru")).toBe(formatKzt(15000));
    expect(formatDual(15000, "zh")).toContain("元");
    expect(formatDual(15000, "en")).toContain("$");
  });
});

describe("lang", () => {
  it("picks the first supported language by quality", () => {
    expect(langFromAcceptLanguage("zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh");
    expect(langFromAcceptLanguage("de-DE,de;q=0.9,en;q=0.5")).toBe("en");
    expect(langFromAcceptLanguage("kk-KZ,ru;q=0.8")).toBe("kk");
    expect(langFromAcceptLanguage(null, "ru")).toBe("ru");
  });
});

describe("dates", () => {
  it("counts nights across months", () => {
    expect(nightsBetween("2027-07-12", "2027-07-14")).toBe(2);
    expect(nightsBetween("2027-07-30", "2027-08-02")).toBe(3);
  });
  it("formats ranges per language", () => {
    expect(formatRange("2027-07-12", "2027-07-14", "ru")).toBe("12–14 июля");
    expect(formatRange("2027-07-12", "2027-07-14", "zh")).toBe("7月12日至14日");
    expect(formatRange("2027-07-12", "2027-07-14", "en")).toBe("Jul 12–14");
    expect(formatRange("2027-07-12", "2027-07-14", "kk")).toBe("12–14 шілде");
    expect(formatRange("2027-07-30", "2027-08-02", "kk")).toBe("30 шілде – 2 тамыз");
  });
});

describe("whatsapp message", () => {
  const msg = whatsappMessage({
    hostName: "Ерлан",
    guestName: "Ли Вэй",
    guestLang: "zh",
    guests: 2,
    dateFrom: "2027-07-12",
    dateTo: "2027-07-14",
    nights: 2,
    totalKzt: 30000,
    questionRu: "Можете организовать машину до озера Кольсай?",
    replyUrl: "https://qonaq.kz/r/7F3K2M?k=SECRET",
  });
  it("matches the product doc format", () => {
    expect(msg).toBe(
      [
        "Здравствуйте, Ерлан! Заявка через Qonaq.",
        "Гость: Ли Вэй (Китай), 2 человека",
        "Даты: 12–14 июля (2 ночи), по прайсу 30 000 ₸",
        "Вопрос: Можете организовать машину до озера Кольсай?",
        "Ответить гостю на его языке: https://qonaq.kz/r/7F3K2M?k=SECRET",
      ].join("\n"),
    );
  });
  it("builds an encoded wa.me link", () => {
    const link = waLink("77011234567", msg);
    expect(link.startsWith("https://wa.me/77011234567?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1])).toBe(msg);
  });
});

describe("quick replies", () => {
  it("answers 'available' in all four languages", () => {
    const r = quickReply("available", { dateFrom: "2027-07-12", dateTo: "2027-07-14" });
    expect(r.zh).toBe("您好！7月12日至14日有空房，期待您的到来。");
    expect(r.ru).toContain("12–14 июля");
    expect(r.kk).toContain("шілде");
    expect(r.en).toContain("Jul 12–14");
  });
  it("includes the car price", () => {
    const r = quickReply("car", { dateFrom: "2027-07-12", dateTo: "2027-07-14", car: KOLSAI_CAR });
    expect(r.zh).toBe("可以安排「科尔赛湖包车」，8,000坚戈。");
    expect(r.ru).toBe(`Да, «Машина до Кольсайских озёр» можем организовать — ${formatKzt(8000)}.`);
  });
});

const KOLSAI_CAR = {
  priceKzt: 8000,
  name: { kk: "Көлсай көлдеріне көлік", ru: "Машина до Кольсайских озёр", en: "Car to Kolsai Lakes", zh: "科尔赛湖包车" },
};
const KAINDY_CAR = {
  priceKzt: 10000,
  name: { kk: "Қайыңды көліне көлік", ru: "Машина до озера Каинды", en: "Car to Kaindy Lake", zh: "凯恩迪湖包车" },
};

describe("car texts", () => {
  it("quote the house's own car service, never another place", () => {
    const r = quickReply("car", { dateFrom: "2027-07-12", dateTo: "2027-07-14", car: KAINDY_CAR });
    expect(Object.values(r).join(" ")).not.toMatch(/Кольсай|Көлсай|Kolsai|科尔赛/);
    expect(r.en).toContain("Car to Kaindy Lake");
    expect(carQuestion(KAINDY_CAR).ru).toBe("Хотим заказать «Машина до озера Каинды». Это возможно?");
  });
  it("fall back to a plain car text without a named service", () => {
    const r = quickReply("car", { dateFrom: "2027-07-12", dateTo: "2027-07-14", car: { priceKzt: null, name: { kk: "", ru: "", en: "", zh: "" } } });
    expect(r.ru).toBe("Машина есть, можем отвезти.");
    expect(carQuestion(null).ru).toBe("Можете организовать машину?");
  });
});

describe("kazakh genitive", async () => {
  const { kkGenitive } = await import("./names");
  it("follows vowel harmony and the last sound", () => {
    expect(kkGenitive("Ерлан")).toBe("Ерланның");
    expect(kkGenitive("Айгүл")).toBe("Айгүлдің");
    expect(kkGenitive("Нұрлан")).toBe("Нұрланның");
    expect(kkGenitive("Гүлнар")).toBe("Гүлнардың");
    expect(kkGenitive("Бауыржан")).toBe("Бауыржанның");
    expect(kkGenitive("Әсет")).toBe("Әсеттің");
    expect(kkGenitive("Әсел")).toBe("Әселдің");
    expect(kkGenitive("Айгерім")).toBe("Айгерімнің");
    expect(kkGenitive("Дана")).toBe("Дананың");
  });
});

describe("house capacity", async () => {
  const { maxGuests } = await import("@/components/tourist/price");
  it("caps guests at rooms × guests per room", () => {
    expect(maxGuests(4, 2)).toBe(8);
    expect(maxGuests(10, 3)).toBe(12);
    expect(maxGuests(null, 2)).toBe(12);
    expect(maxGuests(1, 1)).toBe(1);
  });
});

describe("input checks", async () => {
  const { normalizeWhatsapp } = await import("./phone");
  const { isRealDate } = await import("./templates");
  it("normalises Kazakh WhatsApp numbers", () => {
    expect(normalizeWhatsapp("+7 701 123 45 67")).toBe("77011234567");
    expect(normalizeWhatsapp("8 701 123 45 67")).toBe("77011234567");
    expect(normalizeWhatsapp("701 123 45 67")).toBe("77011234567");
    expect(normalizeWhatsapp("12345")).toBeNull();
  });
  it("rejects impossible calendar dates", () => {
    expect(isRealDate("2027-02-28")).toBe(true);
    expect(isRealDate("2028-02-29")).toBe(true);
    expect(isRealDate("2027-02-30")).toBe(false);
    expect(isRealDate("2027-13-01")).toBe(false);
  });
});
