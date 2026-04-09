import { MenuData, PageFormat } from "@/types/menu";

export interface MenuTheme {
  id: string;
  name: string;
  description: string;
  style: string;
  colors: {
    menuBg: string;
    menuTitle: string;
    menuSubtitle: string;
    menuPrice: string;
    menuDescription: string;
    menuDivider: string;
    menuOrnament: string;
    menuTagBg: string;
    menuTagText: string;
    menuAllergenBg: string;
    menuAllergenText: string;
  };
  fonts: {
    display: string;
    menu: string;
    body: string;
  };
  fontImport: string;
}

export const MENU_THEMES: MenuTheme[] = [
  {
    id: "classic-gold",
    name: "Clásico Dorado",
    description: "Elegancia tradicional con tonos dorados y tipografía serif",
    style: "fine-dining",
    colors: {
      menuBg: "40 30% 96%",
      menuTitle: "30 15% 12%",
      menuSubtitle: "36 45% 42%",
      menuPrice: "30 15% 12%",
      menuDescription: "30 8% 45%",
      menuDivider: "36 50% 65%",
      menuOrnament: "36 45% 55%",
      menuTagBg: "36 60% 50%",
      menuTagText: "40 20% 97%",
      menuAllergenBg: "35 20% 90%",
      menuAllergenText: "30 8% 45%",
    },
    fonts: { display: "'Playfair Display', serif", menu: "'Cormorant Garamond', serif", body: "'Inter', sans-serif" },
    fontImport: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "midnight-silver",
    name: "Medianoche y Plata",
    description: "Fondo oscuro con acentos plateados, ideal para cocktail bars",
    style: "gastrobar",
    colors: {
      menuBg: "220 20% 12%",
      menuTitle: "0 0% 92%",
      menuSubtitle: "220 15% 65%",
      menuPrice: "0 0% 88%",
      menuDescription: "220 10% 55%",
      menuDivider: "220 15% 30%",
      menuOrnament: "220 15% 45%",
      menuTagBg: "220 30% 40%",
      menuTagText: "0 0% 95%",
      menuAllergenBg: "220 15% 20%",
      menuAllergenText: "220 10% 60%",
    },
    fonts: { display: "'Bodoni Moda', serif", menu: "'Lora', serif", body: "'DM Sans', sans-serif" },
    fontImport: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "olive-garden",
    name: "Jardín Mediterráneo",
    description: "Verdes oliva y crema, estilo rústico italiano",
    style: "bistro",
    colors: {
      menuBg: "45 25% 94%",
      menuTitle: "90 15% 18%",
      menuSubtitle: "80 30% 35%",
      menuPrice: "90 15% 18%",
      menuDescription: "60 8% 42%",
      menuDivider: "80 20% 60%",
      menuOrnament: "80 25% 45%",
      menuTagBg: "80 40% 40%",
      menuTagText: "45 25% 95%",
      menuAllergenBg: "60 15% 88%",
      menuAllergenText: "60 10% 42%",
    },
    fonts: { display: "'Libre Baskerville', serif", menu: "'Source Serif 4', serif", body: "'Nunito Sans', sans-serif" },
    fontImport: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Nunito+Sans:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "terracotta",
    name: "Terracota Cálido",
    description: "Tonos tierra y terracota, ideal para cocina de autor",
    style: "casual",
    colors: {
      menuBg: "30 30% 95%",
      menuTitle: "15 25% 18%",
      menuSubtitle: "15 50% 40%",
      menuPrice: "15 25% 18%",
      menuDescription: "20 10% 45%",
      menuDivider: "15 35% 60%",
      menuOrnament: "15 45% 50%",
      menuTagBg: "15 55% 48%",
      menuTagText: "30 30% 97%",
      menuAllergenBg: "20 18% 88%",
      menuAllergenText: "20 10% 45%",
    },
    fonts: { display: "'DM Serif Display', serif", menu: "'Crimson Text', serif", body: "'Work Sans', sans-serif" },
    fontImport: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Work+Sans:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "minimal-ink",
    name: "Tinta Minimal",
    description: "Blanco puro y negro, diseño minimalista japonés",
    style: "fine-dining",
    colors: {
      menuBg: "0 0% 100%",
      menuTitle: "0 0% 8%",
      menuSubtitle: "0 0% 35%",
      menuPrice: "0 0% 8%",
      menuDescription: "0 0% 45%",
      menuDivider: "0 0% 80%",
      menuOrnament: "0 0% 55%",
      menuTagBg: "0 0% 10%",
      menuTagText: "0 0% 97%",
      menuAllergenBg: "0 0% 93%",
      menuAllergenText: "0 0% 45%",
    },
    fonts: { display: "'Noto Serif', serif", menu: "'Noto Serif', serif", body: "'Noto Sans', sans-serif" },
    fontImport: "https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Sans:wght@300;400;500;600;700&display=swap",
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function createBlankMenu(name: string, format: PageFormat, theme: MenuTheme): MenuData {
  return {
    restaurantName: name || "Mi Restaurante",
    subtitle: "Carta",
    seasonLabel: "",
    description: "",
    footer: "Todos nuestros precios incluyen IVA",
    pageFormat: format,
    themeId: theme.id,
    pages: [
      {
        id: uid(),
        title: "Entrantes",
        categories: [
          {
            id: uid(),
            name: "Entrantes",
            items: [
              { id: uid(), name: "Plato de ejemplo", description: "Descripción del plato", price: "12€", allergens: [], tags: [] },
            ],
          },
        ],
      },
    ],
  };
}
