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
  sections?: { categoryName: string; items: MenuItem[] }[];
}

/**
 * Pagination engine:
 * - Each section (category) never shares a page with another section.
 * - Max 6 items per page. If a section has >6 items, it splits into chunks of 6.
 * - Sections with 1-6 items occupy exactly one page.
 */
function paginateMenu(menu: MenuData): RenderedPage[] {
  const pages: RenderedPage[] = [];

  // Cover page
  pages.push({ type: "cover" });

  // Content pages — flatten all categories across all menu.pages
  const allCategories: MenuCategory[] = [];
  for (const page of menu.pages) {
    for (const cat of page.categories) {
      allCategories.push(cat);
    }
  }

  for (const cat of allCategories) {
    if (cat.items.length === 0) continue;

    // Split into chunks of MAX_ITEMS_PER_PAGE
    const chunks: MenuItem[][] = [];
    for (let i = 0; i < cat.items.length; i += MAX_ITEMS_PER_PAGE) {
      chunks.push(cat.items.slice(i, i + MAX_ITEMS_PER_PAGE));
    }

    for (const chunk of chunks) {
      pages.push({
        type: "content",
        sections: [{ categoryName: cat.name, items: chunk }],
      });
    }
  }

  // Footer page
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
                  {/* Category header */}
                  <div className="text-center mb-6 pt-2">
                    <div className="menu-ornament w-16 mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-semibold text-menu-title tracking-wide">
                      {section.categoryName}
                    </h2>
                    <div className="menu-ornament w-16 mx-auto mt-4" />
                  </div>
                  {/* Items */}
                  <div className="space-y-4 flex-1">
                    {section.items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        item={item}
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
      {/* Decorative inner border — respects print margins */}
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

function MenuItemRow({ item, isSelected, onClick }: { item: MenuItem; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded px-3 py-2 transition-all duration-200 ${
        isSelected ? "bg-accent/10 ring-1 ring-accent/30" : "hover:bg-accent/5"
      }`}
    >
      {item.tags.length > 0 && (
        <div className="flex gap-1.5 mb-1">
          {item.tags.map((tag) => (
            <span key={tag} className="font-body text-[9px] font-semibold uppercase tracking-widest bg-menu-tag-bg text-menu-tag-text px-2 py-0.5 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-2">
        <h3 className="font-menu text-[15px] font-semibold text-menu-title flex-shrink-0 leading-snug">
          {item.name}
        </h3>
        <div className="flex-shrink-0 border-b border-dotted border-menu-divider/50 flex-1 min-w-[20px] mx-1 mb-1" />
        <span className="font-body text-sm font-semibold text-menu-price whitespace-nowrap">
          {item.price}
        </span>
      </div>

      {item.halfPrice && (
        <p className="font-body text-xs text-menu-description ml-0 mt-0.5">
          ½ ración: {item.halfPrice}
        </p>
      )}

      {item.unit && (
        <p className="font-body text-xs text-menu-description mt-0.5">{item.unit}</p>
      )}

      {item.description && (
        <p className="font-menu text-[13px] text-menu-description italic mt-1 leading-relaxed">
          {item.description}
        </p>
      )}

      {item.allergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {item.allergens.map((a) => (
            <span key={a} className="font-body text-[9px] text-menu-allergen-text bg-menu-allergen-bg px-1.5 py-0.5 rounded">
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
