import { MenuData } from "@/types/menu";

export type MenuLanguage = "es" | "en" | "fr";

export const MENU_LANGUAGE_OPTIONS: { code: MenuLanguage; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
];

export const HALF_PORTION_LABELS: Record<MenuLanguage, string> = {
  es: "½ ración",
  en: "½ portion",
  fr: "½ portion",
};

const FIXED_TRANSLATIONS: Record<Exclude<MenuLanguage, "es">, Record<string, string>> = {
  en: {
    Gluten: "Gluten",
    Crustáceos: "Crustaceans",
    Huevos: "Eggs",
    Pescado: "Fish",
    Cacahuetes: "Peanuts",
    Soja: "Soy",
    Lácteos: "Dairy",
    "Frutos secos": "Nuts",
    Apio: "Celery",
    Mostaza: "Mustard",
    Sésamo: "Sesame",
    Sulfitos: "Sulphites",
    Altramuces: "Lupin",
    Moluscos: "Molluscs",
  },
  fr: {
    Gluten: "Gluten",
    Crustáceos: "Crustacés",
    Huevos: "Œufs",
    Pescado: "Poisson",
    Cacahuetes: "Arachides",
    Soja: "Soja",
    Lácteos: "Produits laitiers",
    "Frutos secos": "Fruits à coque",
    Apio: "Céleri",
    Mostaza: "Moutarde",
    Sésamo: "Sésame",
    Sulfitos: "Sulfites",
    Altramuces: "Lupin",
    Moluscos: "Mollusques",
  },
};

const CACHE_PREFIX = "cartastudio-menu-translation-v1";

function hashText(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function cacheKey(language: Exclude<MenuLanguage, "es">, source: string): string {
  return `${CACHE_PREFIX}:${language}:${hashText(source)}`;
}

function readCache(language: Exclude<MenuLanguage, "es">, source: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(language, source));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { source?: string; translated?: string };
    if (parsed.source !== source || !parsed.translated) return null;
    return parsed.translated;
  } catch {
    return null;
  }
}

function writeCache(language: Exclude<MenuLanguage, "es">, source: string, translated: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cacheKey(language, source), JSON.stringify({ source, translated }));
  } catch {
    // Ignore storage quota/privacy mode errors; translation still works for the current session.
  }
}

async function translateText(source: string, language: Exclude<MenuLanguage, "es">): Promise<string> {
  const trimmed = source.trim();
  if (!trimmed) return source;

  const fixed = FIXED_TRANSLATIONS[language][trimmed];
  if (fixed) return fixed;

  const cached = readCache(language, source);
  if (cached) return cached;

  const params = new URLSearchParams({
    client: "gtx",
    sl: "es",
    tl: language,
    dt: "t",
    q: source,
  });

  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error("Unexpected translation response");
  }

  const translated = payload[0]
    .map((segment) => (Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : ""))
    .join("")
    .trim();

  if (!translated) {
    throw new Error("Empty translation response");
  }

  writeCache(language, source, translated);
  return translated;
}

async function buildTranslationMap(
  texts: string[],
  language: Exclude<MenuLanguage, "es">,
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(texts.filter((text) => text.trim().length > 0)));
  const result = new Map<string, string>();
  const queue = [...unique];
  const workerCount = Math.min(6, queue.length);

  async function worker() {
    while (queue.length > 0) {
      const source = queue.shift();
      if (!source) continue;
      result.set(source, await translateText(source, language));
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return result;
}

function collectMenuTexts(menu: MenuData): string[] {
  const texts: string[] = [];
  const add = (value?: string) => {
    if (value?.trim()) texts.push(value);
  };

  add(menu.subtitle);
  add(menu.seasonLabel);
  add(menu.description);
  add(menu.footer);

  for (const page of menu.pages) {
    add(page.title);
    add(page.subtitle);
    for (const category of page.categories) {
      add(category.name);
      for (const item of category.items) {
        add(item.name);
        add(item.description);
        add(item.unit);
        item.tags.forEach(add);
        item.allergens.forEach(add);
      }
    }
  }

  return texts;
}

export async function translateMenuContent(menu: MenuData, language: MenuLanguage): Promise<MenuData> {
  if (language === "es") return menu;

  const translations = await buildTranslationMap(collectMenuTexts(menu), language);
  const tr = (value?: string): string | undefined => {
    if (!value) return value;
    return translations.get(value) ?? FIXED_TRANSLATIONS[language][value.trim()] ?? value;
  };

  return {
    ...menu,
    // Restaurant name, logo, prices, layout and styling are deliberately left untouched.
    subtitle: tr(menu.subtitle),
    seasonLabel: tr(menu.seasonLabel),
    description: tr(menu.description),
    footer: tr(menu.footer),
    pages: menu.pages.map((page) => ({
      ...page,
      title: tr(page.title),
      subtitle: tr(page.subtitle),
      categories: page.categories.map((category) => ({
        ...category,
        name: tr(category.name) ?? category.name,
        items: category.items.map((item) => ({
          ...item,
          name: tr(item.name) ?? item.name,
          description: tr(item.description),
          unit: tr(item.unit),
          tags: item.tags.map((tag) => tr(tag) ?? tag),
          allergens: item.allergens.map((allergen) => tr(allergen) ?? allergen),
        })),
      })),
    })),
  };
}
