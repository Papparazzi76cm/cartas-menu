import { useEffect, useMemo, useRef, useState } from "react";
import { MenuPreview as BaseMenuPreview } from "@/components/MenuPreview";
import { MenuData } from "@/types/menu";
import {
  HALF_PORTION_LABELS,
  MENU_LANGUAGE_OPTIONS,
  MenuLanguage,
  translateMenuContent,
} from "@/lib/menuTranslation";

interface MultilingualMenuPreviewProps {
  menu: MenuData;
  selectedItemId?: string | null;
  onSelectItem?: (id: string) => void;
}

export function MultilingualMenuPreview({
  menu,
  selectedItemId,
  onSelectItem,
}: MultilingualMenuPreviewProps) {
  const [language, setLanguage] = useState<MenuLanguage>("es");
  const [translatedMenu, setTranslatedMenu] = useState<MenuData>(menu);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(false);
  const previewRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    if (language === "es") {
      setTranslatedMenu(menu);
      setIsTranslating(false);
      setTranslationError(false);
      return () => {
        cancelled = true;
      };
    }

    setIsTranslating(true);
    setTranslationError(false);

    // Small debounce prevents a request burst while the user is actively editing Spanish content.
    timer = window.setTimeout(() => {
      translateMenuContent(menu, language)
        .then((result) => {
          if (!cancelled) setTranslatedMenu(result);
        })
        .catch((error) => {
          console.error("No se pudo traducir la carta", error);
          if (!cancelled) {
            setTranslatedMenu(menu);
            setTranslationError(true);
          }
        })
        .finally(() => {
          if (!cancelled) setIsTranslating(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [menu, language]);

  // "½ ración" is template copy rendered by the existing preview component rather than MenuData.
  // Keep it multilingual too, without translating any CartaStudio application controls.
  useEffect(() => {
    const root = previewRootRef.current;
    if (!root) return;

    const frame = window.requestAnimationFrame(() => {
      root.querySelectorAll("p").forEach((paragraph) => {
        const text = paragraph.textContent?.trim() ?? "";
        const separatorIndex = text.indexOf(":");
        if (separatorIndex === -1) return;

        const prefix = text.slice(0, separatorIndex).trim();
        if (!["½ ración", "½ portion"].includes(prefix)) return;

        const price = text.slice(separatorIndex + 1).trim();
        paragraph.textContent = `${HALF_PORTION_LABELS[language]}: ${price}`;
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [language, translatedMenu]);

  const languageStatus = useMemo(() => {
    if (isTranslating) return "Traduciendo contenido…";
    if (translationError) return "No se pudo traducir; se muestra el original";
    return null;
  }, [isTranslating, translationError]);

  return (
    <div ref={previewRootRef} className="w-full flex flex-col items-center">
      <div
        data-menu-language-selector
        className="sticky top-3 z-30 mt-3 flex items-center gap-2 rounded-xl border border-border bg-editor-sidebar/95 px-3 py-2 shadow-md backdrop-blur"
      >
        <span className="text-xs font-medium text-muted-foreground">Idioma de la carta</span>
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
          {MENU_LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              aria-pressed={language === option.code}
              onClick={() => setLanguage(option.code)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                language === option.code
                  ? "bg-editor-sidebar text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {languageStatus && (
          <span className={`text-[10px] ${translationError ? "text-destructive" : "text-muted-foreground"}`}>
            {languageStatus}
          </span>
        )}
      </div>

      <BaseMenuPreview
        menu={translatedMenu}
        selectedItemId={selectedItemId}
        onSelectItem={onSelectItem}
      />
    </div>
  );
}
