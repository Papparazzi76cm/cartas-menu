import { useMemo } from "react";
import { MenuData, MenuCategory, MenuItem, PAGE_FORMATS, PRINT_MARGINS, MAX_ITEMS_PER_PAGE } from "@/types/menu";
import { motion } from "framer-motion";

interface MenuPreviewProps {
  menu: MenuData;
  selectedItemId?: string | null;
  onSelectItem?: (id: string) => void;
}

/** Represents one rendered page */
interface RenderedPage {
  type: "cover" | "content" | "footer";
  sections?: { categoryName: string; items: MenuItem[]; fontScale: number }[];
}

/**
 * Compute how many pages a category actually needs (auto).
 */
function autoPageCount(itemCount: number): number {
  if (itemCount === 0) return 0;
  return Math.ceil(itemCount / MAX_ITEMS_PER_PAGE);
}

/**
 * Pagination engine with per-section page span and font scaling.
 */
function paginateMenu(menu: MenuData): RenderedPage[] {
  const pages: RenderedPage[] = [];
  pages.push({ type: "cover" });

  const allCategories: MenuCategory[] = [];
  for (const page of menu.pages) {
    for (const cat of page.categories) {
      allCategories.push(cat);
    }
  }

  for (const cat of allCategories) {
    if (cat.items.length === 0) continue;

    const naturalPages = autoPageCount(cat.items.length);
    const targetPages = cat.pagesSpan && cat.pagesSpan >= 1 ? cat.pagesSpan : naturalPages;

    // Items per page for this section
    const itemsPerPage = Math.ceil(cat.items.length / targetPages);

    // Font scale: if user forces fewer pages than natural, shrink; if more, grow
    // Scale relative to the "ideal" of MAX_ITEMS_PER_PAGE items per page
    const density = itemsPerPage / MAX_ITEMS_PER_PAGE; // >1 means cramped, <1 means spacious
    // Clamp scale between 0.65 and 1.3
    const fontScale = Math.min(1.3, Math.max(0.65, 1 / density));

    // Distribute items across targetPages
    for (let p = 0; p < targetPages; p++) {
      const start = p * itemsPerPage;
      const chunk = cat.items.slice(start, start + itemsPerPage);
      if (chunk.length === 0) {
        // Empty page (user requested more pages than items) — show header only
        pages.push({
          type: "content",
          sections: [{ categoryName: cat.name, items: [], fontScale: 1.3 }],
        });
      } else {
        pages.push({
          type: "content",
          sections: [{ categoryName: cat.name, items: chunk, fontScale }],
        });
      }
    }
  }

  if (menu.footer) {
    pages.push({ type: "footer" });
  }

  return pages;
}

/** Convert mm to CSS px at 96 DPI (screen) — 1mm ≈ 3.7795px */
const MM_TO_PX = 3.7795;

export function MenuPreview({ menu, selectedItemId, onSelectItem }: MenuPreviewProps) {
  const renderedPages = useMemo(() => paginateMenu(menu), [menu]);
  const format = PAGE_FORMATS[menu.pageFormat];
  const pageWidthPx = format.widthMM * MM_TO_PX;
  const pageHeightPx = format.heightMM * MM_TO_PX;

  const paddingTop = PRINT_MARGINS.top * MM_TO_PX;
  const paddingBottom = PRINT_MARGINS.bottom * MM_TO_PX;
  const paddingLeft = PRINT_MARGINS.left * MM_TO_PX;
  const paddingRight = PRINT_MARGINS.right * MM_TO_PX;

  const contentStyle: React.CSSProperties = {
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {renderedPages.map((page, idx) => (
        <MenuPageContainer key={idx} widthPx={pageWidthPx} heightPx={pageHeightPx}>
          {page.type === "cover" && (
            <div style={contentStyle} className="flex flex-col items-center justify-center text-center">
              <div className="menu-ornament-thick w-24 mb-10" />
              <h1 className="font-display text-5xl font-semibold text-menu-title tracking-wide leading-tight">
                {menu.restaurantName}
              </h1>
              {menu.subtitle && (
                <p className="font-menu text-2xl text-menu-subtitle mt-3 italic tracking-widest">
                  {menu.subtitle}
                </p>
              )}
              <div className="menu-ornament w-40 my-8" />
              {menu.seasonLabel && (
                <p className="font-menu text-lg text-menu-subtitle tracking-[0.3em] uppercase">
                  {menu.seasonLabel}
                </p>
              )}
              {menu.description && (
                <p className="font-menu text-base text-menu-description mt-8 max-w-md leading-relaxed italic">
                  {menu.description}
                </p>
              )}
              <div className="menu-ornament-thick w-24 mt-10" />
            </div>
          )}

          {page.type === "content" && page.sections && (
            <div style={contentStyle} className="flex flex-col justify-start">
              {page.sections.map((section, si) => (
                <div key={si} className="flex-1 flex flex-col">
                  {/* Category header — scales title too */}
                  <div className="text-center mb-6 pt-2">
                    <div className="menu-ornament w-16 mx-auto mb-4" />
                    <h2
                      className="font-display font-semibold text-menu-title tracking-wide"
                      style={{ fontSize: `${1.5 * section.fontScale}rem` }}
                    >
                      {section.categoryName}
                    </h2>
                    <div className="menu-ornament w-16 mx-auto mt-4" />
                  </div>
                  {/* Items */}
                  <div className="flex-1" style={{ gap: `${1 * section.fontScale}rem`, display: "flex", flexDirection: "column" }}>
                    {section.items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        item={item}
                        fontScale={section.fontScale}
                        isSelected={selectedItemId === item.id}
                        onClick={() => onSelectItem?.(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {page.type === "footer" && (
            <div style={contentStyle} className="flex items-center justify-center">
              <p className="font-menu text-sm text-menu-description text-center leading-relaxed italic">
                {menu.footer}
              </p>
            </div>
          )}
        </MenuPageContainer>
      ))}
    </div>
  );
}

function MenuPageContainer({ children, widthPx, heightPx }: { children: React.ReactNode; widthPx: number; heightPx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-menu-page
      className="bg-menu-bg shadow-xl rounded-sm border border-border/50 relative overflow-hidden"
      style={{ width: widthPx, height: heightPx }}
    >
      <div
        className="absolute border border-menu-divider/30 pointer-events-none rounded-sm"
        style={{
          top: PRINT_MARGINS.top * MM_TO_PX * 0.6,
          left: PRINT_MARGINS.left * MM_TO_PX * 0.6,
          right: PRINT_MARGINS.right * MM_TO_PX * 0.6,
          bottom: PRINT_MARGINS.bottom * MM_TO_PX * 0.6,
        }}
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}

function MenuItemRow({ item, fontScale, isSelected, onClick }: { item: MenuItem; fontScale: number; isSelected: boolean; onClick: () => void }) {
  const nameSize = 15 * fontScale;
  const descSize = 13 * fontScale;
  const priceSize = 14 * fontScale;
  const metaSize = 12 * fontScale;
  const tagSize = 9 * fontScale;
  const allergenSize = 9 * fontScale;
  const py = 8 * fontScale;
  const px = 12 * fontScale;

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded transition-all duration-200 ${
        isSelected ? "bg-accent/10 ring-1 ring-accent/30" : "hover:bg-accent/5"
      }`}
      style={{ padding: `${py}px ${px}px` }}
    >
      {item.tags.length > 0 && (
        <div className="flex gap-1.5 mb-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="font-body font-semibold uppercase tracking-widest bg-menu-tag-bg text-menu-tag-text rounded-sm"
              style={{ fontSize: tagSize, padding: `${2 * fontScale}px ${8 * fontScale}px` }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-2">
        <h3
          className="font-menu font-semibold text-menu-title flex-shrink-0 leading-snug"
          style={{ fontSize: nameSize }}
        >
          {item.name}
        </h3>
        <div className="flex-shrink-0 border-b border-dotted border-menu-divider/50 flex-1 min-w-[20px] mx-1 mb-1" />
        <span
          className="font-body font-semibold text-menu-price whitespace-nowrap"
          style={{ fontSize: priceSize }}
        >
          {item.price}
        </span>
      </div>

      {item.halfPrice && (
        <p className="font-body text-menu-description ml-0" style={{ fontSize: metaSize, marginTop: 2 * fontScale }}>
          ½ ración: {item.halfPrice}
        </p>
      )}

      {item.unit && (
        <p className="font-body text-menu-description" style={{ fontSize: metaSize, marginTop: 2 * fontScale }}>{item.unit}</p>
      )}

      {item.description && (
        <p
          className="font-menu text-menu-description italic leading-relaxed"
          style={{ fontSize: descSize, marginTop: 4 * fontScale }}
        >
          {item.description}
        </p>
      )}

      {item.allergens.length > 0 && (
        <div className="flex flex-wrap gap-1" style={{ marginTop: 6 * fontScale }}>
          {item.allergens.map((a) => (
            <span
              key={a}
              className="font-body text-menu-allergen-text bg-menu-allergen-bg rounded"
              style={{ fontSize: allergenSize, padding: `${2 * fontScale}px ${6 * fontScale}px` }}
            >
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
