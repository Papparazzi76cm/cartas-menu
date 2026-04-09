import { MenuData } from "@/types/menu";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const sampleMenu: MenuData = {
  restaurantName: "Los Molinos",
  subtitle: "Restaurante",
  seasonLabel: "Temporada Otoño / Invierno",
  description: "Intentamos respetar los productos que nos ofrece la tierra según su disponibilidad estacional, adaptando constantemente nuestra propuesta.",
  footer: "Carta dirigida por Javier Mariscal y su equipo · Todos nuestros precios incluyen IVA · Consulte disponibilidad de platos por encargo",
  pageFormat: "A4",
  pages: [
    {
      id: uid(),
      title: "Para Empezar y Compartir",
      categories: [
        {
          id: uid(),
          name: "Para Empezar y Compartir",
          items: [
            { id: uid(), name: "Aguacate braseado con tomates cherry, albahaca y burrata rota aliñada", price: "18€", allergens: ["Lácteos"], tags: [], description: "" },
            { id: uid(), name: "Oreja brava a la plancha", description: "Oreja cocida de forma especial, cortada en tacos y marcada en plancha semicrocante. Con pimientos de Padrón.", price: "16€", allergens: ["Gluten", "Soja", "Apio", "Sulfitos"], tags: [] },
            { id: uid(), name: "Croquetas de jamón", description: "Con lámina de jamón al corte.", price: "2,20€", unit: "unidad", allergens: ["Gluten", "Huevos", "Lácteos", "Apio", "Sulfitos"], tags: [] },
            { id: uid(), name: "Jamón cortado a cuchillo", price: "17,50€", halfPrice: "9,50€", allergens: [], tags: [] },
            { id: uid(), name: "Escabeche de morrillo de atún", description: "Escabeche tradicional de morrillo, parte de la cabeza del atún, muy equilibrada en grasa. Algo único y diferente de probar.", price: "20€", allergens: ["Pescado", "Sulfitos"], tags: [] },
            { id: uid(), name: "Pimientos asados morrón y chocolate con anchoas", description: "Pimientos asados en nuestro horno, pelados artesanalmente, aderezados por nuestro aliño secreto y anchoas para acompañar.", price: "16€", allergens: ["Pescado", "Soja"], tags: [] },
            { id: uid(), name: "Empanadillas argentinas", description: "Rellenas de carne picada de Wagyu y paté, acompañadas de chimichurri para aderezar a su gusto.", price: "4€", allergens: ["Gluten", "Huevos", "Sulfitos"], tags: ["NUEVO"] },
            { id: uid(), name: "Torrija de foie con cecina de Wagyu", description: "Compota de queso y miel Santa Espina sobre cebolla caramelizada y trompetas.", price: "26€", halfPrice: "13€", allergens: ["Gluten", "Huevos", "Apio", "Sulfitos"], tags: ["2º Premio Mejor Torrija Salada de España"] },
            { id: uid(), name: "Arroz socarrat relleno de tartar de marisco y lactonesa", price: "23€", halfPrice: "12,50€", allergens: ["Crustáceos", "Pescado"], tags: [] },
            { id: uid(), name: "Ensaladilla rusa Los Molinos con ventresca y langostinos", price: "14,50€", halfPrice: "7,50€", allergens: ["Huevos", "Pescado"], tags: [] },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Guisos",
      categories: [
        {
          id: uid(),
          name: "Guisos",
          items: [
            { id: uid(), name: "Callos, pata y morros estilo tradicional", price: "16€", allergens: ["Soja", "Lácteos", "Apio"], tags: [] },
            { id: uid(), name: "Guiso de carrilleras", description: "Con estroganoff de champiñones.", price: "18,50€", allergens: ["Gluten", "Soja", "Lácteos", "Apio", "Mostaza", "Sulfitos"], tags: [] },
            { id: uid(), name: "Guiso de morrillo de atún y huevo frito de codorniz", description: "Salsa de tomate con un matiz de comino donde guisamos el atún troceado.", price: "20€", allergens: ["Pescado", "Lácteos", "Apio", "Sulfitos"], tags: [] },
            { id: uid(), name: "Rabo guisado al estilo tradicional con patatas", price: "23€", allergens: ["Gluten", "Lácteos", "Apio", "Sulfitos"], tags: [] },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Pescados y Mariscos",
      categories: [
        {
          id: uid(),
          name: "Pescados, conchas y mariscos",
          items: [
            { id: uid(), name: "Salpicón de langostino tigre", description: "Salpicón de langostinos tigre (5 ud.) con aliño de vinagre de Jerez, tomates pata negra y brotes.", price: "20€", allergens: ["Crustáceos", "Sulfitos"], tags: [] },
            { id: uid(), name: "Calamares", description: "Con mayo de adobo y aliño de limón a su gusto.", price: "15€", allergens: ["Gluten", "Crustáceos"], tags: [] },
            { id: uid(), name: "Gambas al ajillo", price: "16€", allergens: ["Crustáceos"], tags: [] },
            { id: uid(), name: "Churrasco de atún", description: "Elaborado con parpatana de atún, situada entre la ventresca y la cabeza, cortada como si fuera un churrasco de ternera. Con chimichurri y verduras de temporada.", price: "Según mercado", allergens: ["Lácteos", "Apio", "Sulfitos"], tags: [] },
            { id: uid(), name: "Boquerones en vinagre", description: "Sobre cebolleta fresca, ajo frito y perejil.", price: "12,50€", allergens: ["Pescado", "Sulfitos"], tags: [] },
            { id: uid(), name: "Pescados de la Bahía La Alondra", description: "Con agua de Lourdes y verduras de temporada. Lubina a la plancha o frita, mero negro, pargo, urta o rodaballo.", price: "Consultar", allergens: ["Sulfitos"], tags: [] },
          ],
        },
        {
          id: uid(),
          name: "La Cuchara",
          items: [
            { id: uid(), name: "La cuchara de la semana", description: "Patatas importancia con cocochas de bacalao.", price: "20€", allergens: ["Crustáceos", "Pescado", "Apio", "Sulfitos"], tags: [] },
            { id: uid(), name: "Los Jueves Cocido Completo", description: "Por encargo en temporada de invierno.", price: "22,50€", allergens: [], tags: [] },
          ],
        },
      ],
    },
    {
      id: uid(),
      title: "Asados y Carnes",
      categories: [
        {
          id: uid(),
          name: "Asados",
          items: [
            { id: uid(), name: "Pluma asada", description: "Marinada en miso con mojo thai y limón asado.", price: "18€", allergens: ["Soja", "Lácteos", "Apio", "Sulfitos"], tags: [] },
            { id: uid(), name: "Mollejas de ternera confitadas", description: "Con yema curada y chimichurri. Mollejas confitadas y terminadas en plancha con jugo de carne.", price: "18€", allergens: ["Gluten", "Huevos", "Lácteos", "Apio", "Sulfitos"], tags: [] },
            { id: uid(), name: "Brazuelo asado para dos personas", description: "Brazuelo de lechazo asado acompañado de ensalada de tomate pata negra y patatas panaderas.", price: "Por encargo", allergens: ["Sulfitos"], tags: [] },
            { id: uid(), name: "Picantón asado al estilo tradicional", description: "O relleno de duxelle de champiñones y trufa.", price: "Por encargo", allergens: [], tags: [] },
          ],
        },
        {
          id: uid(),
          name: "Carnes",
          items: [
            { id: uid(), name: "Steak tartar aliño tradicional", description: "Acompañado de tostas.", price: "22€", allergens: ["Gluten", "Huevos", "Soja", "Lácteos", "Mostaza", "Sulfitos"], tags: [] },
            { id: uid(), name: "Albóndigas rellenas de foie", description: "Sobre parmentier.", price: "18€", halfPrice: "9,50€", allergens: ["Gluten", "Huevos", "Lácteos", "Apio", "Sulfitos"], tags: [] },
            { id: uid(), name: "Chuleta de Wagyu", description: "Según el peso.", price: "Consultar", allergens: [], tags: [] },
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
            { id: uid(), name: "Postre del chef tradición", price: "Consultar", allergens: [], tags: [] },
            { id: uid(), name: "Fresas salteadas con sorbete de yogur", price: "8€", allergens: ["Gluten", "Huevos", "Lácteos"], tags: [] },
            { id: uid(), name: "Piña osmotizada con ron, espuma de arroz con leche y helado de coco", price: "8€", allergens: ["Sulfitos"], tags: [] },
          ],
        },
      ],
    },
  ],
};
