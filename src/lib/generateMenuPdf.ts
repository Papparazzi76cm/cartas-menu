import { createElement } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { MENU_THEMES } from "@/lib/themes";
import { MenuData, PAGE_FORMATS } from "@/types/menu";

function getPdfFileName(menuData: MenuData) {
  const baseName = menuData.restaurantName?.trim() || "carta";
  return `${baseName.replace(/\s+/g, "_")}_carta.pdf`;
}

function applyThemeToElement(host: HTMLElement, menuData: MenuData) {
  const theme = MENU_THEMES.find((item) => item.id === menuData.themeId);
  if (!theme) return () => undefined;

  host.style.setProperty("--menu-bg", theme.colors.menuBg);
  host.style.setProperty("--menu-title", theme.colors.menuTitle);
  host.style.setProperty("--menu-subtitle", theme.colors.menuSubtitle);
  host.style.setProperty("--menu-price", theme.colors.menuPrice);
  host.style.setProperty("--menu-description", theme.colors.menuDescription);
  host.style.setProperty("--menu-divider", theme.colors.menuDivider);
  host.style.setProperty("--menu-ornament", theme.colors.menuOrnament);
  host.style.setProperty("--menu-tag-bg", theme.colors.menuTagBg);
  host.style.setProperty("--menu-tag-text", theme.colors.menuTagText);
  host.style.setProperty("--menu-allergen-bg", theme.colors.menuAllergenBg);
  host.style.setProperty("--menu-allergen-text", theme.colors.menuAllergenText);
  host.style.setProperty("--font-display", theme.fonts.display);
  host.style.setProperty("--font-menu", theme.fonts.menu);
  host.style.setProperty("--font-body", theme.fonts.body);

  const fontAlreadyLoaded = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(
    (link) => link.getAttribute("href") === theme.fontImport || link.href === theme.fontImport,
  );

  if (fontAlreadyLoaded) return () => undefined;

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = theme.fontImport;
  fontLink.setAttribute("data-export-theme-font", "true");
  document.head.appendChild(fontLink);

  return () => {
    fontLink.remove();
  };
}

async function waitForStableMenuLayout(scope: ParentNode) {
  await document.fonts.ready;

  const images = Array.from(scope.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete) {
        if (image.decode) {
          try {
            await image.decode();
          } catch {
            // Ignore decode failures and continue with the rendered image.
          }
        }
        return;
      }

      await new Promise<void>((resolve) => {
        const done = () => resolve();
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
      });
    }),
  );

  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function getExportRoots(scope: ParentNode) {
  return Array.from(scope.querySelectorAll<HTMLElement>("[data-menu-page]"))
    .map((page) => page.querySelector<HTMLElement>("[data-export-root]") ?? page)
    .filter(Boolean);
}

function createCaptureOptions(target: HTMLElement, backgroundColor: string, foreignObjectRendering: boolean) {
  const rect = target.getBoundingClientRect();

  return {
    scale: Math.max(2, Math.ceil(window.devicePixelRatio || 1)),
    useCORS: true,
    allowTaint: false,
    backgroundColor,
    width: rect.width,
    height: rect.height,
    foreignObjectRendering,
    logging: false,
    onclone: (clonedDoc: Document) => {
      clonedDoc.documentElement.style.cssText = document.documentElement.style.cssText;
      clonedDoc.querySelectorAll<HTMLElement>("[data-menu-page], [data-export-root]").forEach((node) => {
        node.style.transform = "none";
        node.style.animation = "none";
        node.style.transition = "none";
      });
    },
  };
}

async function capturePageCanvas(target: HTMLElement) {
  const backgroundColor = getComputedStyle(target).backgroundColor || "#ffffff";

  try {
    return await html2canvas(target, createCaptureOptions(target, backgroundColor, true));
  } catch (error) {
    console.warn("Fallo con foreignObjectRendering, usando fallback estándar", error);
    return html2canvas(target, createCaptureOptions(target, backgroundColor, false));
  }
}

async function buildPdfFromRoots(exportRoots: HTMLElement[], menuData: MenuData) {
  const format = PAGE_FORMATS[menuData.pageFormat];
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [format.widthMM, format.heightMM],
  });

  for (let index = 0; index < exportRoots.length; index += 1) {
    const canvas = await capturePageCanvas(exportRoots[index]);
    const imageData = canvas.toDataURL("image/png");

    if (index > 0) {
      pdf.addPage();
    }

    pdf.addImage(imageData, "PNG", 0, 0, format.widthMM, format.heightMM);
  }

  return pdf;
}

export async function saveMenuPdfFromPreview(previewRoot: HTMLElement, menuData: MenuData) {
  await waitForStableMenuLayout(previewRoot);
  const exportRoots = getExportRoots(previewRoot);

  if (exportRoots.length === 0) {
    throw new Error("No hay páginas para exportar");
  }

  const pdf = await buildPdfFromRoots(exportRoots, menuData);
  pdf.save(getPdfFileName(menuData));
}

export async function generateMenuPdfBlob(menuData: MenuData): Promise<Blob> {
  const { MenuPreview } = await import("@/components/MenuPreview");

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.pointerEvents = "none";
  container.style.opacity = "0";
  container.style.width = "fit-content";
  container.style.height = "auto";

  const cleanupTheme = applyThemeToElement(container, menuData);
  document.body.appendChild(container);

  const reactRoot = createRoot(container);

  try {
    reactRoot.render(createElement(MenuPreview, { menu: menuData }));
    await waitForStableMenuLayout(container);

    const exportRoots = getExportRoots(container);
    if (exportRoots.length === 0) {
      throw new Error("No hay páginas para compartir");
    }

    const pdf = await buildPdfFromRoots(exportRoots, menuData);
    return pdf.output("blob");
  } finally {
    reactRoot.unmount();
    cleanupTheme();
    container.remove();
  }
}
