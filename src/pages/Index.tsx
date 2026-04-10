import { useState, useRef, useCallback, useEffect } from "react";
import { MenuData, PAGE_FORMATS } from "@/types/menu";
import { sampleMenu } from "@/data/sampleMenu";
import { MenuPreview } from "@/components/MenuPreview";
import { EditorPanel } from "@/components/EditorPanel";
import { SaveMenuButton, LoadMenuButton } from "@/components/SaveLoadMenu";
import { NewMenuDialog } from "@/components/NewMenuDialog";
import { MENU_THEMES } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Download, Eye, Edit3, Utensils, Printer } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

/** Apply a theme's CSS custom properties + font families */
function applyTheme(themeId?: string) {
  const theme = MENU_THEMES.find((t) => t.id === themeId);
  if (!theme) return;

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

  // Load font
  const existingLink = document.querySelector("link[data-theme-font]");
  if (existingLink) existingLink.remove();
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = theme.fontImport;
  link.setAttribute("data-theme-font", "true");
  document.head.appendChild(link);

  // Apply font families via CSS custom properties
  root.style.setProperty("--font-display", theme.fonts.display);
  root.style.setProperty("--font-menu", theme.fonts.menu);
  root.style.setProperty("--font-body", theme.fonts.body);
}

const PDF_CAPTURE_SCALE = 4;

async function waitForStableMenuLayout(container?: HTMLElement | null) {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const images = container ? Array.from(container.querySelectorAll<HTMLImageElement>("img")) : [];
  await Promise.all(
    images.map((image) => {
      if (image.complete) {
        if (typeof image.decode === "function") {
          return image.decode().catch(() => undefined);
        }

        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const done = () => {
          image.removeEventListener("load", done);
          image.removeEventListener("error", done);
          resolve();
        };

        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
      });
    }),
  );

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function prepareClonedMenuPage(clonedDoc: Document) {
  clonedDoc.documentElement.style.cssText = document.documentElement.style.cssText;

  clonedDoc.querySelectorAll<HTMLElement>("[data-export-root]").forEach((page) => {
    page.style.transform = "none";
    page.style.opacity = "1";
    page.style.animation = "none";
    page.style.transition = "none";
  });
}

export default function Index() {
  const [menu, setMenu] = useState<MenuData>(sampleMenu);
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Apply theme when menu changes
  useEffect(() => {
    if (menu.themeId) {
      applyTheme(menu.themeId);
    }
  }, [menu.themeId]);

  const exportPDF = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    toast.info("Generando PDF...");

    try {
      await waitForStableMenuLayout(previewRef.current);

      const pages = Array.from(previewRef.current.querySelectorAll<HTMLElement>("[data-export-root]"));
      if (pages.length === 0) {
        throw new Error("No hay páginas para exportar");
      }

      const fmt = PAGE_FORMATS[menu.pageFormat];
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
        const el = pages[i];
        const rect = el.getBoundingClientRect();

        const canvas = await html2canvas(el, {
          scale: PDF_CAPTURE_SCALE,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: bgColor,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          onclone: prepareClonedMenuPage,
        });

        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        canvas.width = 0;
        canvas.height = 0;
      }

      pdf.save(`${menu.restaurantName.replace(/\s+/g, "_")}_carta.pdf`);
      toast.success("PDF exportado correctamente");
    } catch (err) {
      toast.error("Error al exportar PDF");
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [menu.restaurantName, menu.pageFormat]);

  const handlePrint = useCallback(() => {
    if (!previewRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("No se pudo abrir la ventana de impresión");
      return;
    }

    const fmt = PAGE_FORMATS[menu.pageFormat];
    const pages = previewRef.current.querySelectorAll("[data-export-root]");
    let pagesHtml = "";
    pages.forEach((page) => {
      pagesHtml += `<div class="print-page">${page.outerHTML}</div>`;
    });

    // Get all stylesheets
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${menu.restaurantName} - Carta</title>
        ${styles}
        <style>
          @page {
            size: ${fmt.widthMM}mm ${fmt.heightMM}mm;
            margin: 0;
          }
          body { margin: 0; padding: 0; background: white; }
          .print-page {
            page-break-after: always;
            width: ${fmt.widthMM}mm;
            height: ${fmt.heightMM}mm;
            overflow: hidden;
            display: flex;
          }
          .print-page:last-child { page-break-after: avoid; }
          .print-page > * { width: 100% !important; height: 100% !important; }
        </style>
      </head>
      <body>${pagesHtml}</body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, [menu.restaurantName, menu.pageFormat]);

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 bg-editor-sidebar border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Utensils className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">CartaStudio</h1>
            <p className="text-[10px] text-muted-foreground">Editor de cartas profesional</p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setMode("edit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "edit"
                ? "bg-editor-sidebar shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Editar
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "preview"
                ? "bg-editor-sidebar shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Vista previa
          </button>
        </div>

        <NewMenuDialog
          onCreate={(newMenu) => {
            setMenu(newMenu);
            setCurrentMenuId(null);
            setSelectedItemId(null);
          }}
        />

        <SaveMenuButton menu={menu} currentMenuId={currentMenuId} onSaved={(saved) => setCurrentMenuId(saved.id)} />
        <LoadMenuButton
          onLoad={(loadedMenu, id) => {
            setMenu(loadedMenu);
            setCurrentMenuId(id);
          }}
        />

        <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
          <Printer className="w-3.5 h-3.5" />
          Imprimir
        </Button>

        <Button
          size="sm"
          onClick={exportPDF}
          disabled={exporting}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          {exporting ? "Exportando..." : "Exportar PDF"}
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Sidebar */}
        {mode === "edit" && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-[380px] flex-shrink-0 border-r border-border overflow-hidden"
          >
            <EditorPanel
              menu={menu}
              onChange={setMenu}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
            />
          </motion.div>
        )}

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-editor-bg">
          <div ref={previewRef} className="flex flex-col items-center">
            <MenuPreview
              menu={menu}
              selectedItemId={mode === "edit" ? selectedItemId : null}
              onSelectItem={mode === "edit" ? setSelectedItemId : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
