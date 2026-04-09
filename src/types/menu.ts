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
}

export interface MenuPage {
  id: string;
  title?: string;
  subtitle?: string;
  categories: MenuCategory[];
}

export interface MenuData {
  restaurantName: string;
  subtitle?: string;
  seasonLabel?: string;
  description?: string;
  footer?: string;
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
