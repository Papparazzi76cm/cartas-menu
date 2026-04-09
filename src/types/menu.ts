export interface Allergen {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  halfPrice?: string;
  unit?: string;
  allergens: string[];
  tags: string[];
  image?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
  /** Number of pages this section should span. Auto-calculated if omitted. */
  pagesSpan?: number;
}

export interface MenuPage {
  id: string;
  title?: string;
  subtitle?: string;
  categories: MenuCategory[];
  /** Number of columns for this page layout (default 1) */
  columns?: number;
}

export type PageFormat = 'A4' | 'A5' | 'A3' | 'Letter';

export const PAGE_FORMATS: Record<PageFormat, { label: string; widthMM: number; heightMM: number }> = {
  A3: { label: 'DIN A3 (297×420 mm)', widthMM: 297, heightMM: 420 },
  A4: { label: 'DIN A4 (210×297 mm)', widthMM: 210, heightMM: 297 },
  A5: { label: 'DIN A5 (148×210 mm)', widthMM: 148, heightMM: 210 },
  Letter: { label: 'US Letter (216×279 mm)', widthMM: 216, heightMM: 279 },
};

/** Safe printable margins in mm */
export const PRINT_MARGINS = { top: 12, bottom: 12, left: 10, right: 10 };

/** Max items per page chunk for a section */
export const MAX_ITEMS_PER_PAGE = 6;

export interface MenuData {
  restaurantName: string;
  subtitle?: string;
  seasonLabel?: string;
  description?: string;
  footer?: string;
  pageFormat: PageFormat;
  pages: MenuPage[];
}

export interface MenuTemplate {
  id: string;
  name: string;
  description: string;
  style: 'fine-dining' | 'casual' | 'gastrobar' | 'bistro';
}

export const ALLERGEN_LIST = [
  'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes',
  'Soja', 'Lácteos', 'Frutos secos', 'Apio', 'Mostaza',
  'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
];
