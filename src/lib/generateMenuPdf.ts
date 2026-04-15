import { MenuData, PAGE_FORMATS } from "@/types/menu";
import { MENU_THEMES } from "@/lib/themes";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import { createElement } from "react";

/**
 * Generates a PDF Blob from MenuData by rendering MenuPreview offscreen.
 */
export async function generateMenuPdfBlob(menuData: MenuData): Promise<Blob> {
  // Dynamically import MenuPreview to avoid circular deps
  const { MenuPreview } = await import("@/components/MenuPreview");

  // Apply theme temporarily
  const theme = MENU_THEMES.find((t) => t.id === menuData.themeId);
  if (theme) {
    const root = document.documentElement;
    root.style.setProperty("--menu-bg", theme.colors.menuBg);
    root.style.setProperty("--menu-title", theme.colors.menuTitle);
    root.style.setProperty("--menu-subtitle", theme.colors.menuSubtitle);
    root.style.setProperty("--menu-price", theme.colors.menuPrice);
    root.style.setProperty("--menu-description", theme.colors.menuDescription);
    root.style.setProperty("--menu-divider", theme.colors.menuDivider);
    root.style.setProperty("--menu-ornament", theme.colors.menuOrnament);
    root.style.setProperty("--menu-tag-bg", theme.colors.menuTagBg);
    root.style.setProperty("--menu-tag-text", theme.colors.menuTagText);
    root.style.setProperty("--menu-allergen-bg", theme.colors.menuAllergenBg);
    root.style.setProperty("--menu-allergen-text", theme.colors.menuAllergenText);
    root.style.setProperty("--font-display", theme.fonts.display);
    root.style.setProperty("--font-menu", theme.fonts.menu);
    root.style.setProperty("--font-body", theme.fonts.body);

    // Load font
    const existingLink = document.querySelector("link[data-theme-font]");
    if (existingLink) existingLink.remove();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = theme.fontImport;
    link.setAttribute("data-theme-font", "true");
    document.head.appendChild(link);
  }

  // Create offscreen container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.zIndex = "-1";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const reactRoot = createRoot(container);
  reactRoot.render(createElement(MenuPreview, { menu: menuData }));

  // Wait for render + fonts
  await new Promise((r) => setTimeout(r, 500));
  await document.fonts.ready;

  const pages = container.querySelectorAll("[data-menu-page]");
  const fmt = PAGE_FORMATS[menuData.pageFormat];
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [fmt.widthMM, fmt.heightMM],
  });
  const pageWidth = fmt.widthMM;
  const pageHeight = fmt.heightMM;

  const computedBg = getComputedStyle(document.documentElement).getPropertyValue("--menu-bg").trim();
  const bgColor = computedBg ? `hsl(${computedBg})` : "#ffffff";

  for (let i = 0; i < pages.length; i++) {
    const el = pages[i] as HTMLElement;
    el.style.borderRadius = "0";
    el.style.boxShadow = "none";
    el.style.border = "none";

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: bgColor,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
  }

  // Cleanup
  reactRoot.unmount();
  document.body.removeChild(container);

  return pdf.output("blob");
}
