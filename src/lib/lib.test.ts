import { describe, expect, it } from "vitest";
import { randomCode, slugify } from "./codes";
import { formatDual, formatIn, formatKzt } from "./currency";
import { langFromAcceptLanguage } from "./lang";
import { formatRange, nightsBetween, quickReply, waLink, whatsappMessage } from "./templates";

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
    const r = quickReply("car", { dateFrom: "2027-07-12", dateTo: "2027-07-14", carPriceKzt: 8000 });
    expect(r.zh).toBe("可以安排车去科尔赛湖，8,000坚戈。");
    expect(r.ru).toContain("8 000 ₸");
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
