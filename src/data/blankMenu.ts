import { MenuData } from "@/types/menu";

export const blankMenu: MenuData = {
  restaurantName: "",
  subtitle: "",
  seasonLabel: "",
  description: "",
  footer: "",
  pageFormat: "A4",
  themeId: "classic",
  pages: [
    {
      id: crypto.randomUUID(),
      title: "",
      categories: [
        {
          id: crypto.randomUUID(),
          name: "",
          items: [],
        },
      ],
    },
  ],
};
