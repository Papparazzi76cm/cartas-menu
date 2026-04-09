import { useState, useRef, useCallback } from "react";
import { MenuData, PAGE_FORMATS } from "@/types/menu";
import { sampleMenu } from "@/data/sampleMenu";
import { MenuPreview } from "@/components/MenuPreview";
import { EditorPanel } from "@/components/EditorPanel";
import { SaveMenuButton, LoadMenuButton } from "@/components/SaveLoadMenu";
import { Button } from "@/components/ui/button";
import { Download, Eye, Edit3, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export default function Index() {
  const [menu, setMenu] = useState<MenuData>(sampleMenu);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const exportPDF = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    toast.info("Generando PDF...");

    try {
      const pages = previewRef.current.querySelectorAll("[data-menu-page]");
      const fmt = PAGE_FORMATS[menu.pageFormat];
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [fmt.widthMM, fmt.heightMM] });
      const pageWidth = fmt.widthMM;
      const pageHeight = fmt.heightMM;

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 3,
          useCORS: true,
          backgroundColor: null,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);
      }

      pdf.save(`${menu.restaurantName.replace(/\s+/g, "_")}_carta.pdf`);
      toast.success("PDF exportado correctamente");
    } catch (err) {
      toast.error("Error al exportar PDF");
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [menu.restaurantName]);

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 bg-editor-sidebar border-b border-border flex items-center px-4 gap-4 flex-shrink-0">
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
              mode === "edit" ? "bg-editor-sidebar shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Editar
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "preview" ? "bg-editor-sidebar shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Vista previa
          </button>
        </div>

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
