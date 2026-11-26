import type { Extra, Localized, ListingText } from "@/lib/types";

/**
 * Demo catalog for Saty. All hosts are fictional (isDemo = true) until real hosts join.
 * Inserted automatically into an empty database.
 */

interface SeedListing {
  id: string;
  slug: string;
  hostName: string;
  hostNames: Localized;
  whatsapp: string;
  rooms: number;
  priceKzt: number;
  priceGuests: number;
  breakfastIncluded: boolean;
  checkIn: string;
  lat: number;
  lng: number;
  extras: Extra[];
  content: Localized<ListingText>;
  palette: [string, string, string, string]; // sky, far mountains, near mountains, accent
  scene: "lake" | "yurt" | "river" | "garden" | "house";
}

const SATY: Localized = { kk: "Саты", ru: "Саты", en: "Saty", zh: "萨特村" };

const name = (kk: string, ru: string, en: string, zh: string): Localized => ({ kk, ru, en, zh });

export const SEED_VILLAGE = { slug: "saty", name: SATY };

export const SEED_LISTINGS: SeedListing[] = [
  {
    id: "0b6f0b8e-0001-4c1a-9a00-5a7e00000001",
    slug: "erlan",
    hostName: "Ерлан",
    hostNames: name("Ерлан", "Ерлан", "Erlan", "叶尔兰"),
    whatsapp: "77000000001",
    rooms: 4,
    priceKzt: 15000,
    priceGuests: 2,
    breakfastIncluded: true,
    checkIn: "14:00",
    lat: 43.0608,
    lng: 78.4112,
    palette: ["#CFE6EA", "#8FB3BC", "#3F6F73", "#E8A33D"],
    scene: "lake",
    extras: [
      { id: "e1-sauna", kind: "sauna", priceKzt: 10000, name: name("Монша", "Баня", "Russian-style sauna (banya)", "俄式桑拿浴") },
      { id: "e1-car", kind: "car", priceKzt: 8000, name: name("Қолсай көліне көлік", "Машина до озера Кольсай", "Car to Kolsai Lakes", "去科尔赛湖的车") },
    ],
    content: {
      kk: {
        title: "Ерланның қонақ үйі · Саты",
        description: "Саты ауылындағы төрт бөлмелі қонақ үй, Қолсай көліне дейін 20 минут. Екі адамға арналған бөлме таңғы аспен бірге. Монша бар, Қолсайға көлікпен апарамыз.",
        rules: "Кіру 14:00-ден кейін.",
      },
      ru: {
        title: "Гостевой дом Ерлана · Саты",
        description: "Гостевой дом на 4 комнаты в селе Саты, 20 минут до озера Кольсай. Двухместная комната с завтраком. Есть баня, можем отвезти на Кольсай на машине.",
        rules: "Заезд после 14:00.",
      },
      en: {
        title: "Erlan's guesthouse · Saty",
        description: "A four-room guesthouse in Saty village, 20 minutes from Kolsai Lakes. Double rooms come with breakfast. There is a banya, and Erlan can drive you to Kolsai.",
        rules: "Check-in after 14:00.",
      },
      zh: {
        title: "叶尔兰之家 · 萨特村",
        description: "位于萨特村的家庭旅馆，共4间客房，距科尔赛湖约20分钟车程。双人间含早餐。有俄式桑拿浴，可安排车去科尔赛湖。",
        rules: "入住时间：14:00以后。",
      },
    },
  },
  {
    id: "0b6f0b8e-0002-4c1a-9a00-5a7e00000002",
    slug: "aigul",
    hostName: "Айгүл",
    hostNames: name("Айгүл", "Айгуль", "Aigul", "艾古丽"),
    whatsapp: "77000000002",
    rooms: 3,
    priceKzt: 12000,
    priceGuests: 2,
    breakfastIncluded: true,
    checkIn: "13:00",
    lat: 43.0589,
    lng: 78.4071,
    palette: ["#F3E4D2", "#C9A98A", "#7A5C45", "#2F7D74"],
    scene: "house",
    extras: [
      { id: "e2-horse", kind: "horse", priceKzt: 5000, name: name("Атпен серуен (1 сағат)", "Прогулка на лошади (1 час)", "Horse ride (1 hour)", "骑马（1小时）") },
      { id: "e2-meal", kind: "meal", priceKzt: 3000, name: name("Үй тағамы, кешкі ас", "Домашний ужин", "Home-cooked dinner", "家常晚餐") },
    ],
    content: {
      kk: {
        title: "Айгүл апайдың үйі · Саты",
        description: "Ауыл ортасындағы жылы үй, үш бөлме. Таңғы ас бағаға кіреді, кешке үй тағамын дайындаймыз. Атпен серуенге шығуға болады.",
        rules: "Кіру 13:00-ден кейін. Үйде темекі шегуге болмайды.",
      },
      ru: {
        title: "Дом Айгуль апай · Саты",
        description: "Тёплый дом в центре села, три комнаты. Завтрак включён, вечером готовим домашний ужин. Можно покататься на лошади.",
        rules: "Заезд после 13:00. В доме не курят.",
      },
      en: {
        title: "Aigul's home · Saty",
        description: "A warm family house in the centre of the village with three rooms. Breakfast is included and a home-cooked dinner is available. Horse rides can be arranged.",
        rules: "Check-in after 13:00. No smoking indoors.",
      },
      zh: {
        title: "艾古丽之家 · 萨特村",
        description: "村中心温馨的家庭住宅，共3间客房。含早餐，晚上可提供家常晚餐。可以安排骑马。",
        rules: "入住时间：13:00以后。室内禁止吸烟。",
      },
    },
  },
  {
    id: "0b6f0b8e-0003-4c1a-9a00-5a7e00000003",
    slug: "nurlan",
    hostName: "Нұрлан",
    hostNames: name("Нұрлан", "Нурлан", "Nurlan", "努尔兰"),
    whatsapp: "77000000003",
    rooms: 5,
    priceKzt: 18000,
    priceGuests: 3,
    breakfastIncluded: true,
    checkIn: "15:00",
    lat: 43.0552,
    lng: 78.4183,
    palette: ["#DCE9F2", "#9DB4C8", "#4A6378", "#C8553D"],
    scene: "yurt",
    extras: [
      { id: "e3-guide", kind: "guide", priceKzt: 15000, name: name("Қайыңды көліне гид", "Гид до озера Каинды", "Guide to Kaindy Lake", "凯恩迪湖向导") },
      { id: "e3-car", kind: "car", priceKzt: 10000, name: name("Қолсай көліне көлік", "Машина до озера Кольсай", "Car to Kolsai Lakes", "去科尔赛湖的车") },
    ],
    content: {
      kk: {
        title: "Нұрланның киіз үй лагері · Саты",
        description: "Ауыл шетіндегі бес киіз үй, әрқайсысы үш адамға. Таңғы ас бар. Қайыңды көліне гидпен барып, Қолсайға көлікпен апарамыз.",
        rules: "Кіру 15:00-ден кейін.",
      },
      ru: {
        title: "Юрточный лагерь Нурлана · Саты",
        description: "Пять юрт на краю села, каждая на трёх человек. Завтрак включён. Гид до озера Каинды и машина до Кольсая.",
        rules: "Заезд после 15:00.",
      },
      en: {
        title: "Nurlan's yurt camp · Saty",
        description: "Five yurts at the edge of the village, each for three people. Breakfast is included. Nurlan offers a guided trip to Kaindy Lake and a car to Kolsai.",
        rules: "Check-in after 15:00.",
      },
      zh: {
        title: "努尔兰毡房营地 · 萨特村",
        description: "村边的5座毡房，每座可住3人，含早餐。可提供凯恩迪湖向导，以及去科尔赛湖的车。",
        rules: "入住时间：15:00以后。",
      },
    },
  },
  {
    id: "0b6f0b8e-0004-4c1a-9a00-5a7e00000004",
    slug: "gulnar",
    hostName: "Гүлнар",
    hostNames: name("Гүлнар", "Гульнар", "Gulnar", "古丽娜尔"),
    whatsapp: "77000000004",
    rooms: 2,
    priceKzt: 10000,
    priceGuests: 2,
    breakfastIncluded: true,
    checkIn: "14:00",
    lat: 43.0621,
    lng: 78.4035,
    palette: ["#E7EFD9", "#AFC291", "#5F7A3E", "#D9822B"],
    scene: "garden",
    extras: [
      { id: "e4-car", kind: "car", priceKzt: 10000, name: name("Қайыңды көліне көлік", "Машина до озера Каинды", "Car to Kaindy Lake", "去凯恩迪湖的车") },
    ],
    content: {
      kk: {
        title: "Гүлнардың бақшалы үйі · Саты",
        description: "Алма бағы бар шағын үй, екі бөлме. Таңғы ас бағаға кіреді. Қайыңды көліне көлікпен апарамыз.",
        rules: "Кіру 14:00-ден кейін.",
      },
      ru: {
        title: "Дом с садом у Гульнар · Саты",
        description: "Небольшой дом с яблоневым садом, две комнаты. Завтрак включён. Отвезём на озеро Каинды.",
        rules: "Заезд после 14:00.",
      },
      en: {
        title: "Gulnar's garden house · Saty",
        description: "A small house with an apple orchard and two rooms. Breakfast is included. Gulnar can arrange a car to Kaindy Lake.",
        rules: "Check-in after 14:00.",
      },
      zh: {
        title: "古丽娜尔花园小屋 · 萨特村",
        description: "带苹果园的小房子，共2间客房，含早餐。可安排车去凯恩迪湖。",
        rules: "入住时间：14:00以后。",
      },
    },
  },
  {
    id: "0b6f0b8e-0005-4c1a-9a00-5a7e00000005",
    slug: "bauyrzhan",
    hostName: "Бауыржан",
    hostNames: name("Бауыржан", "Бауыржан", "Bauyrzhan", "包尔江"),
    whatsapp: "77000000005",
    rooms: 3,
    priceKzt: 14000,
    priceGuests: 2,
    breakfastIncluded: false,
    checkIn: "12:00",
    lat: 43.0575,
    lng: 78.4258,
    palette: ["#D6ECEB", "#93C1BE", "#2E6B68", "#E0B04A"],
    scene: "river",
    extras: [
      { id: "e5-sauna", kind: "sauna", priceKzt: 8000, name: name("Монша", "Баня", "Russian-style sauna (banya)", "俄式桑拿浴") },
      { id: "e5-meal", kind: "meal", priceKzt: 2500, name: name("Таңғы ас", "Завтрак", "Breakfast", "早餐") },
    ],
    content: {
      kk: {
        title: "Бауыржанның өзен жағасындағы үйі · Саты",
        description: "Шелек өзенінің жағасындағы үй, үш бөлме. Монша бар. Таңғы ас бөлек төленеді.",
        rules: "Кіру 12:00-ден кейін.",
      },
      ru: {
        title: "Дом у реки Бауыржана · Саты",
        description: "Дом на берегу реки Шелек, три комнаты. Есть баня. Завтрак оплачивается отдельно.",
        rules: "Заезд после 12:00.",
      },
      en: {
        title: "Bauyrzhan's riverside house · Saty",
        description: "A house on the bank of the Shelek River with three rooms. There is a banya. Breakfast is available for an extra charge.",
        rules: "Check-in after 12:00.",
      },
      zh: {
        title: "包尔江河畔小屋 · 萨特村",
        description: "位于谢列克河畔的房子，共3间客房。有俄式桑拿浴。早餐需另付费。",
        rules: "入住时间：12:00以后。",
      },
    },
  },
];

/** Placeholder photo: a flat illustrated landscape, distinct per listing. Replace with real photos. */
export function seedPhotoSvg(l: SeedListing, variant: number): string {
  const [sky, far, near, accent] = l.palette;
  const shift = variant * 37;
  const sceneEl =
    l.scene === "yurt"
      ? `<g transform="translate(${470 - shift},300)"><path d="M0 70 L0 30 Q60 -20 120 30 L120 70 Z" fill="#F7F1E6"/><path d="M0 30 Q60 -20 120 30" stroke="${accent}" stroke-width="8" fill="none"/><rect x="48" y="40" width="24" height="30" fill="${accent}"/></g>
         <g transform="translate(${640 - shift},320) scale(.7)"><path d="M0 70 L0 30 Q60 -20 120 30 L120 70 Z" fill="#F7F1E6"/><path d="M0 30 Q60 -20 120 30" stroke="${accent}" stroke-width="8" fill="none"/></g>`
      : `<g transform="translate(${500 - shift},290)"><rect x="0" y="40" width="150" height="80" fill="#F7F1E6"/><path d="M-12 44 L75 -8 L162 44 Z" fill="${accent}"/><rect x="24" y="64" width="28" height="28" fill="${near}" opacity=".55"/><rect x="98" y="64" width="28" height="56" fill="${near}" opacity=".75"/></g>`;
  const water =
    l.scene === "lake" || l.scene === "river"
      ? `<path d="M0 470 Q200 440 400 468 T800 460 L800 600 L0 600 Z" fill="${far}" opacity=".85"/><path d="M60 505 h120 M320 520 h90 M560 498 h140" stroke="#ffffff" stroke-width="4" opacity=".6" stroke-linecap="round"/>`
      : `<path d="M0 480 Q200 460 400 480 T800 470 L800 600 L0 600 Z" fill="${near}" opacity=".35"/>`;
  const trees = Array.from({ length: 7 }, (_, i) => {
    const x = 40 + ((i * 113 + shift * 3) % 760);
    const h = 60 + ((i * 29) % 40);
    return `<path d="M${x} ${420 - h} L${x - 22} 420 L${x + 22} 420 Z" fill="${near}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
<rect width="800" height="600" fill="${sky}"/>
<circle cx="${640 - shift}" cy="110" r="44" fill="#FFF6E0" opacity=".9"/>
<path d="M0 300 L120 170 L210 250 L330 120 L460 260 L560 150 L680 240 L800 160 L800 600 L0 600 Z" fill="${far}"/>
<path d="M330 120 L300 152 L318 150 L330 162 L344 148 L360 150 Z" fill="#ffffff" opacity=".85"/>
<path d="M0 380 L140 280 L260 350 L400 260 L540 360 L660 300 L800 370 L800 600 L0 600 Z" fill="${near}"/>
<rect y="420" width="800" height="180" fill="${near}" opacity=".9"/>
${trees}
${sceneEl}
${water}
</svg>`;
}

export type { SeedListing };
