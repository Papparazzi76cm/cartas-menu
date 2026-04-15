import { MenuData, MenuPage, PageFormat } from "@/types/menu";

function uid() {
  return crypto.randomUUID();
}

export interface MenuTemplateOption {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  buildMenu: (restaurantName: string, format: PageFormat, themeId: string) => MenuData;
}

function buildBase(
  restaurantName: string,
  format: PageFormat,
  themeId: string,
  subtitle: string,
  footer: string,
  pages: MenuPage[]
): MenuData {
  return {
    restaurantName: restaurantName || "Mi Restaurante",
    subtitle,
    footer,
    pageFormat: format,
    themeId,
    pages,
  };
}

export const MENU_TEMPLATES: MenuTemplateOption[] = [
  {
    id: "blank",
    name: "Carta en blanco",
    description: "Empieza desde cero",
    icon: "📄",
    buildMenu: (name, format, themeId) =>
      buildBase(name, format, themeId, "", "", [
        {
          id: uid(),
          title: "",
          categories: [{ id: uid(), name: "", items: [] }],
        },
      ]),
  },
  {
    id: "desayunos",
    name: "Desayunos y Brunch",
    description: "Tostadas, zumos, huevos, dulces",
    icon: "🥐",
    buildMenu: (name, format, themeId) =>
      buildBase(name, format, themeId, "Desayunos y Brunch", "Todos los precios incluyen IVA", [
        {
          id: uid(),
          title: "Desayunos",
          categories: [
            {
              id: uid(),
              name: "Tostadas",
              items: [
                { id: uid(), name: "Tostada con tomate y AOVE", price: "3,50€", allergens: ["Gluten"], tags: [], description: "Pan de pueblo con tomate rallado y aceite de oliva virgen extra" },
                { id: uid(), name: "Tostada de aguacate", price: "5,50€", allergens: ["Gluten"], tags: ["Popular"], description: "Aguacate triturado, huevo poché, semillas de sésamo y reducción de lima" },
                { id: uid(), name: "Tostada de jamón ibérico", price: "6€", allergens: ["Gluten"], tags: [], description: "Con tomate rallado y un chorrito de aceite de oliva" },
                { id: uid(), name: "Tostada de salmón ahumado", price: "6,50€", allergens: ["Gluten", "Pescado", "Lácteos"], tags: [], description: "Con queso crema, alcaparras y eneldo fresco" },
              ],
            },
            {
              id: uid(),
              name: "Huevos",
              items: [
                { id: uid(), name: "Huevos revueltos con trufa", price: "8€", allergens: ["Huevos", "Lácteos"], tags: [], description: "Huevos de corral con mantequilla y trufa negra rallada" },
                { id: uid(), name: "Huevos benedictine", price: "9€", allergens: ["Huevos", "Gluten", "Lácteos"], tags: ["Popular"], description: "Muffin inglés, jamón cocido, huevo poché y salsa holandesa" },
                { id: uid(), name: "Tortilla española", price: "6€", allergens: ["Huevos"], tags: [], description: "Jugosa, con cebolla caramelizada" },
              ],
            },
            {
              id: uid(),
              name: "Dulce",
              items: [
                { id: uid(), name: "Tortitas con sirope de arce", price: "7€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: [], description: "Stack de tortitas esponjosas con mantequilla y frutos rojos" },
                { id: uid(), name: "Croissant artesano", price: "2,80€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Tarta de zanahoria", price: "5€", allergens: ["Gluten", "Huevos", "Lácteos", "Frutos secos"], tags: [], description: "Con frosting de queso crema y nueces" },
              ],
            },
          ],
        },
        {
          id: uid(),
          title: "Bebidas",
          categories: [
            {
              id: uid(),
              name: "Cafés y Tés",
              items: [
                { id: uid(), name: "Café espresso", price: "1,80€", allergens: [], tags: [], description: "" },
                { id: uid(), name: "Café con leche", price: "2,20€", allergens: ["Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Cappuccino", price: "2,80€", allergens: ["Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Matcha latte", price: "3,50€", allergens: ["Lácteos"], tags: ["NUEVO"], description: "Con leche de avena y espuma cremosa" },
                { id: uid(), name: "Té selección", price: "2,50€", allergens: [], tags: [], description: "Earl Grey, verde, manzanilla o menta" },
              ],
            },
            {
              id: uid(),
              name: "Zumos naturales",
              items: [
                { id: uid(), name: "Zumo de naranja natural", price: "3,50€", allergens: [], tags: [], description: "" },
                { id: uid(), name: "Zumo verde detox", price: "4,50€", allergens: ["Apio"], tags: ["NUEVO"], description: "Espinacas, pepino, manzana, jengibre y limón" },
                { id: uid(), name: "Smoothie de frutos rojos", price: "5€", allergens: ["Lácteos"], tags: [], description: "Fresas, arándanos, frambuesas con yogur natural" },
              ],
            },
          ],
        },
      ]),
  },
  {
    id: "comidas",
    name: "Menú del Día",
    description: "Primer y segundo plato, postre",
    icon: "🍽️",
    buildMenu: (name, format, themeId) =>
      buildBase(name, format, themeId, "Menú del Día", "Menú completo: primer plato + segundo plato + postre o café · 16,50€ · IVA incluido", [
        {
          id: uid(),
          title: "Menú del Día",
          categories: [
            {
              id: uid(),
              name: "Primeros platos",
              items: [
                { id: uid(), name: "Crema de calabaza con picatostes", price: "", allergens: ["Gluten", "Lácteos"], tags: [], description: "Con semillas de calabaza tostadas y aceite de trufa" },
                { id: uid(), name: "Ensalada mixta de la huerta", price: "", allergens: [], tags: [], description: "Tomate, lechuga, cebolla, aceitunas y atún" },
                { id: uid(), name: "Macarrones a la boloñesa", price: "", allergens: ["Gluten", "Lácteos", "Apio"], tags: [], description: "Con ragú de ternera cocinado a fuego lento" },
                { id: uid(), name: "Lentejas estofadas", price: "", allergens: ["Apio"], tags: [], description: "Estilo tradicional con verduras de temporada y chorizo" },
              ],
            },
            {
              id: uid(),
              name: "Segundos platos",
              items: [
                { id: uid(), name: "Pollo asado con patatas", price: "", allergens: [], tags: [], description: "Medio pollo de corral al horno con patatas panaderas" },
                { id: uid(), name: "Merluza a la plancha", price: "", allergens: ["Pescado"], tags: [], description: "Con guarnición de verduras salteadas" },
                { id: uid(), name: "Secreto ibérico", price: "Suplemento 3€", allergens: [], tags: [], description: "A la brasa con pimientos del piquillo confitados" },
                { id: uid(), name: "Albóndigas en salsa", price: "", allergens: ["Gluten", "Huevos", "Apio"], tags: ["Popular"], description: "Albóndigas caseras de ternera en salsa de tomate" },
              ],
            },
            {
              id: uid(),
              name: "Postres",
              items: [
                { id: uid(), name: "Flan casero", price: "", allergens: ["Huevos", "Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Fruta de temporada", price: "", allergens: [], tags: [], description: "" },
                { id: uid(), name: "Arroz con leche", price: "", allergens: ["Lácteos"], tags: [], description: "Con canela y caramelo" },
                { id: uid(), name: "Café o infusión", price: "", allergens: [], tags: [], description: "" },
              ],
            },
          ],
        },
      ]),
  },
  {
    id: "cenas",
    name: "Cenas",
    description: "Entrantes, principales y postres",
    icon: "🌙",
    buildMenu: (name, format, themeId) =>
      buildBase(name, format, themeId, "Carta de Cenas", "Todos nuestros precios incluyen IVA · Consulte alérgenos con nuestro personal", [
        {
          id: uid(),
          title: "Entrantes",
          categories: [
            {
              id: uid(),
              name: "Entrantes",
              items: [
                { id: uid(), name: "Carpaccio de ternera", price: "14€", allergens: ["Lácteos", "Mostaza"], tags: [], description: "Finas láminas con rúcula, parmesano y vinagreta de mostaza antigua" },
                { id: uid(), name: "Tataki de atún rojo", price: "16€", allergens: ["Pescado", "Soja", "Sésamo"], tags: ["Popular"], description: "Marcado al punto con sésamo y salsa ponzu" },
                { id: uid(), name: "Burrata con tomates", price: "13€", allergens: ["Lácteos"], tags: [], description: "Tomates de temporada, pesto fresco y reducción de módena" },
                { id: uid(), name: "Tartar de salmón", price: "15€", allergens: ["Pescado", "Huevos", "Sésamo"], tags: ["NUEVO"], description: "Con aguacate, soja y wasabi sobre tosta crujiente" },
                { id: uid(), name: "Croquetas de boletus", price: "12€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: [], description: "Cremosas por dentro, crujientes por fuera, con alioli de trufa" },
              ],
            },
          ],
        },
        {
          id: uid(),
          title: "Principales",
          categories: [
            {
              id: uid(),
              name: "Pescados",
              items: [
                { id: uid(), name: "Lubina a la espalda", price: "22€", allergens: ["Pescado"], tags: [], description: "Con verduras de temporada y salsa de cítricos" },
                { id: uid(), name: "Bacalao confitado", price: "20€", allergens: ["Pescado", "Lácteos"], tags: [], description: "A baja temperatura con crema de coliflor y pil-pil" },
                { id: uid(), name: "Pulpo a la brasa", price: "24€", allergens: ["Moluscos"], tags: ["Popular"], description: "Sobre parmentier de patata y pimentón de la Vera" },
              ],
            },
            {
              id: uid(),
              name: "Carnes",
              items: [
                { id: uid(), name: "Solomillo de ternera", price: "26€", allergens: ["Lácteos"], tags: [], description: "Con reducción de Pedro Ximénez y patata trufada" },
                { id: uid(), name: "Magret de pato", price: "22€", allergens: [], tags: [], description: "Con salsa de frutos rojos y puré de boniato" },
                { id: uid(), name: "Rack de cordero", price: "28€", allergens: ["Mostaza"], tags: [], description: "En costra de hierbas con ratatouille provenzal" },
                { id: uid(), name: "Entrecot de vaca madurada", price: "30€", allergens: [], tags: ["Premium"], description: "400g, maduración 45 días, con guarnición a elegir" },
              ],
            },
          ],
        },
        {
          id: uid(),
          title: "Postres",
          categories: [
            {
              id: uid(),
              name: "Postres",
              items: [
                { id: uid(), name: "Coulant de chocolate", price: "8€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: ["Popular"], description: "Con helado de vainilla y crumble de almendra" },
                { id: uid(), name: "Tarta de queso", price: "7€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: [], description: "Estilo vasco, con coulis de frutos rojos" },
                { id: uid(), name: "Sorbete de limón al cava", price: "6€", allergens: ["Sulfitos"], tags: [], description: "" },
              ],
            },
          ],
        },
      ]),
  },
  {
    id: "vinos",
    name: "Carta de Vinos",
    description: "Tintos, blancos, rosados, espumosos",
    icon: "🍷",
    buildMenu: (name, format, themeId) =>
      buildBase(name, format, themeId, "Carta de Vinos", "Precios por botella · Consulte disponibilidad de vinos por copa", [
        {
          id: uid(),
          title: "Tintos",
          categories: [
            {
              id: uid(),
              name: "Rioja",
              items: [
                { id: uid(), name: "Viña Ardanza Reserva 2016", price: "32€", allergens: ["Sulfitos"], tags: [], description: "La Rioja Alta. Tempranillo y Garnacha. Elegante, con notas de fruta madura y roble" },
                { id: uid(), name: "Muga Reserva 2019", price: "28€", allergens: ["Sulfitos"], tags: [], description: "Tempranillo, Garnacha, Mazuelo y Graciano. Equilibrado y sedoso" },
                { id: uid(), name: "CVNE Imperial Gran Reserva 2015", price: "52€", allergens: ["Sulfitos"], tags: ["Premium"], description: "Tempranillo. Complejo, con taninos finos y largo final" },
              ],
            },
            {
              id: uid(),
              name: "Ribera del Duero",
              items: [
                { id: uid(), name: "Protos Crianza 2020", price: "22€", allergens: ["Sulfitos"], tags: [], description: "Tempranillo. Frutal, con 14 meses en barrica de roble" },
                { id: uid(), name: "Pesquera Reserva 2018", price: "38€", allergens: ["Sulfitos"], tags: ["Popular"], description: "Tinto Fino. Intenso, estructurado y con gran expresión frutal" },
                { id: uid(), name: "Vega Sicilia Valbuena 5º 2018", price: "120€", allergens: ["Sulfitos"], tags: ["Premium"], description: "Tinto Fino y Merlot. Icónico, profundo y con una complejidad excepcional" },
              ],
            },
          ],
        },
        {
          id: uid(),
          title: "Blancos y Rosados",
          categories: [
            {
              id: uid(),
              name: "Blancos",
              items: [
                { id: uid(), name: "Albariño Pazo Señorans 2023", price: "22€", allergens: ["Sulfitos"], tags: ["Popular"], description: "Rías Baixas. Fresco, mineral y con notas de fruta blanca" },
                { id: uid(), name: "Verdejo Rueda José Pariente 2023", price: "14€", allergens: ["Sulfitos"], tags: [], description: "Herbáceo, fresco y aromático con final persistente" },
                { id: uid(), name: "Godello Gutiérrez de la Vega 2022", price: "18€", allergens: ["Sulfitos"], tags: [], description: "Valdeorras. Mineral, cremoso y con buena acidez" },
                { id: uid(), name: "Enate Chardonnay 234, 2022", price: "16€", allergens: ["Sulfitos"], tags: [], description: "Somontano. Fermentado en barrica, mantecoso y elegante" },
              ],
            },
            {
              id: uid(),
              name: "Rosados",
              items: [
                { id: uid(), name: "Muga Rosado 2023", price: "15€", allergens: ["Sulfitos"], tags: [], description: "Garnacha, Viura y Tempranillo. Fresco, afrutado y de color vivo" },
                { id: uid(), name: "Chivite Las Fincas Rosado 2023", price: "12€", allergens: ["Sulfitos"], tags: [], description: "Navarra. Garnacha. Ligero, ideal para el aperitivo" },
              ],
            },
            {
              id: uid(),
              name: "Espumosos y Cavas",
              items: [
                { id: uid(), name: "Gramona Imperial Gran Reserva 2018", price: "28€", allergens: ["Sulfitos"], tags: ["Popular"], description: "Xarel·lo y Macabeo. Burbuja fina, complejo y elegante" },
                { id: uid(), name: "Recaredo Terrers Brut Nature 2019", price: "24€", allergens: ["Sulfitos"], tags: [], description: "Xarel·lo y Macabeo. Ecológico, fresco y con personalidad" },
                { id: uid(), name: "Moët & Chandon Brut Impérial", price: "55€", allergens: ["Sulfitos"], tags: ["Premium"], description: "Champagne clásico, cremoso y con notas de brioche" },
              ],
            },
          ],
        },
      ]),
  },
  {
    id: "tapas",
    name: "Tapas y Raciones",
    description: "Para picar y compartir",
    icon: "🫒",
    buildMenu: (name, format, themeId) =>
      buildBase(name, format, themeId, "Tapas y Raciones", "Todos nuestros precios incluyen IVA · Consulte alérgenos con nuestro personal", [
        {
          id: uid(),
          title: "Tapas y Raciones",
          categories: [
            {
              id: uid(),
              name: "Tapas frías",
              items: [
                { id: uid(), name: "Salmorejo cordobés", price: "6€", allergens: ["Gluten", "Huevos"], tags: ["Popular"], description: "Con taquitos de jamón serrano y huevo duro" },
                { id: uid(), name: "Ensaladilla rusa", price: "7€", allergens: ["Huevos", "Pescado"], tags: [], description: "Receta tradicional con atún y ventresca" },
                { id: uid(), name: "Gazpacho andaluz", price: "5€", allergens: [], tags: [], description: "Con su guarnición de pepino, pimiento y cebolla" },
                { id: uid(), name: "Tabla de quesos artesanos", price: "14€", allergens: ["Lácteos"], tags: [], description: "Selección de 5 quesos con membrillo y frutos secos" },
                { id: uid(), name: "Boquerones en vinagre", price: "8€", allergens: ["Pescado", "Sulfitos"], tags: [], description: "Marinados en vinagre de Jerez con ajo y perejil" },
              ],
            },
            {
              id: uid(),
              name: "Tapas calientes",
              items: [
                { id: uid(), name: "Croquetas de jamón ibérico", price: "2€", unit: "unidad", allergens: ["Gluten", "Huevos", "Lácteos"], tags: ["Popular"], description: "Cremosas y crujientes, hechas al momento" },
                { id: uid(), name: "Patatas bravas", price: "7€", allergens: ["Gluten"], tags: [], description: "Con salsa brava casera y alioli" },
                { id: uid(), name: "Gambas al ajillo", price: "12€", allergens: ["Crustáceos"], tags: [], description: "Con guindilla y aceite de oliva virgen extra" },
                { id: uid(), name: "Pimientos de Padrón", price: "6€", allergens: [], tags: [], description: "Fritos en aceite de oliva con flor de sal" },
                { id: uid(), name: "Tortilla española", price: "8€", allergens: ["Huevos"], tags: ["Popular"], description: "Jugosa, con cebolla caramelizada" },
                { id: uid(), name: "Chipirones a la andaluza", price: "11€", allergens: ["Gluten", "Moluscos"], tags: [], description: "Fritos con harina fina y limón" },
              ],
            },
            {
              id: uid(),
              name: "Raciones para compartir",
              items: [
                { id: uid(), name: "Jamón ibérico cortado a cuchillo", price: "22€", allergens: [], tags: ["Premium"], description: "Jamón de bellota 100% ibérico de Jabugo" },
                { id: uid(), name: "Pulpo a la gallega", price: "18€", allergens: ["Moluscos"], tags: [], description: "Sobre cama de patata cocida con pimentón de la Vera" },
                { id: uid(), name: "Calamares a la romana", price: "14€", allergens: ["Gluten", "Moluscos"], tags: [], description: "Con alioli casero y limón" },
              ],
            },
          ],
        },
      ]),
  },
  {
    id: "cocktails",
    name: "Cócteles y Bebidas",
    description: "Cócteles clásicos y de autor",
    icon: "🍸",
    buildMenu: (name, format, themeId) =>
      buildBase(name, format, themeId, "Carta de Cócteles", "Consumo responsable · Todos los precios incluyen IVA", [
        {
          id: uid(),
          title: "Cócteles",
          categories: [
            {
              id: uid(),
              name: "Clásicos",
              items: [
                { id: uid(), name: "Negroni", price: "10€", allergens: [], tags: ["Popular"], description: "Gin, Campari, Vermut rosso. Clásico italiano perfecto" },
                { id: uid(), name: "Old Fashioned", price: "11€", allergens: [], tags: [], description: "Bourbon, angostura, azúcar y twist de naranja" },
                { id: uid(), name: "Margarita", price: "10€", allergens: [], tags: [], description: "Tequila, triple sec, lima fresca y borde de sal" },
                { id: uid(), name: "Espresso Martini", price: "11€", allergens: [], tags: ["Popular"], description: "Vodka, licor de café, espresso fresco" },
                { id: uid(), name: "Mojito", price: "9€", allergens: [], tags: [], description: "Ron blanco, lima, hierbabuena, soda y azúcar de caña" },
                { id: uid(), name: "Daiquiri", price: "10€", allergens: [], tags: [], description: "Ron blanco, lima fresca y almíbar. Simple y perfecto" },
              ],
            },
            {
              id: uid(),
              name: "De autor",
              items: [
                { id: uid(), name: "Sunset Boulevard", price: "13€", allergens: [], tags: ["NUEVO"], description: "Mezcal, maracuyá, jalapeño, lima y sal de gusano" },
                { id: uid(), name: "Mediterranean Spritz", price: "12€", allergens: [], tags: [], description: "Gin, vermut blanco, tónica de romero y aceituna" },
                { id: uid(), name: "Velvet Rose", price: "13€", allergens: [], tags: ["NUEVO"], description: "Vodka infusionado en rosas, lichi, champán y agua de rosas" },
              ],
            },
            {
              id: uid(),
              name: "Sin alcohol",
              items: [
                { id: uid(), name: "Virgin Mojito", price: "7€", allergens: [], tags: [], description: "Lima, hierbabuena, soda y azúcar de caña" },
                { id: uid(), name: "Sunset Cooler", price: "7€", allergens: [], tags: [], description: "Zumo de naranja, granadina, lima y soda" },
              ],
            },
          ],
        },
      ]),
  },
  {
    id: "cafeteria",
    name: "Cafetería",
    description: "Cafés, bollería y snacks",
    icon: "☕",
    buildMenu: (name, format, themeId) =>
      buildBase(name, format, themeId, "Cafetería", "Todos los precios incluyen IVA", [
        {
          id: uid(),
          title: "Cafetería",
          categories: [
            {
              id: uid(),
              name: "Cafés",
              items: [
                { id: uid(), name: "Espresso", price: "1,50€", allergens: [], tags: [], description: "" },
                { id: uid(), name: "Cortado", price: "1,70€", allergens: ["Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Café con leche", price: "2€", allergens: ["Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Cappuccino", price: "2,80€", allergens: ["Lácteos"], tags: [], description: "Con espuma cremosa y cacao en polvo" },
                { id: uid(), name: "Café bombón", price: "2,50€", allergens: ["Lácteos"], tags: [], description: "Con leche condensada" },
                { id: uid(), name: "Café con hielo", price: "2,20€", allergens: ["Lácteos"], tags: [], description: "" },
              ],
            },
            {
              id: uid(),
              name: "Bollería y dulces",
              items: [
                { id: uid(), name: "Croissant de mantequilla", price: "2,20€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Napolitana de chocolate", price: "2,50€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Palmera de chocolate", price: "2,80€", allergens: ["Gluten", "Lácteos"], tags: [], description: "" },
                { id: uid(), name: "Tarta de la casa", price: "4€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: [], description: "Consulte sabor del día" },
              ],
            },
            {
              id: uid(),
              name: "Snacks salados",
              items: [
                { id: uid(), name: "Bikini mixto", price: "3,50€", allergens: ["Gluten", "Lácteos"], tags: [], description: "Jamón york y queso gouda" },
                { id: uid(), name: "Tosta de jamón y tomate", price: "4€", allergens: ["Gluten"], tags: ["Popular"], description: "" },
                { id: uid(), name: "Bagel de salmón", price: "5,50€", allergens: ["Gluten", "Pescado", "Lácteos"], tags: [], description: "Con queso crema y rúcula" },
              ],
            },
          ],
        },
      ]),
  },
];
