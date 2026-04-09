import { useMemo } from "react";
import {
  MenuData,
  MenuCategory,
  MenuItem,
  MenuPage,
  PAGE_FORMATS,
  PRINT_MARGINS,
  MAX_ITEMS_PER_PAGE,
  PageStyle,
} from "@/types/menu";
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
  footerText?: string;
  columns?: number;
  pageStyle?: PageStyle;
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

  for (const menuPage of menu.pages) {
    const cats = menuPage.categories.filter((c) => c.items.length > 0);
    if (cats.length === 0) continue;

    const cols = menuPage.columns || 1;

    if (cols >= 2) {
      const maxItemsPerCol = Math.max(...cats.map((c) => c.items.length));
      const density = maxItemsPerCol / (MAX_ITEMS_PER_PAGE + 2);
      const fontScale = Math.min(1.0, Math.max(0.45, 1 / density));
      pages.push({
        type: "content",
        columns: cols,
        pageStyle: menuPage.style,
        sections: cats.map((cat) => ({ categoryName: cat.name, items: cat.items, fontScale })),
      });
      continue;
    }

    const totalItems = cats.reduce((sum, c) => sum + c.items.length, 0);
    const maxCombined = MAX_ITEMS_PER_PAGE + 2;
    const allFitOnOne =
      totalItems <= maxCombined && cats.length > 1 && cats.every((c) => !c.pagesSpan || c.pagesSpan === 1);

    if (allFitOnOne) {
      const density = totalItems / MAX_ITEMS_PER_PAGE;
      const fontScale = Math.min(1.3, Math.max(0.65, 1 / density));
      pages.push({
        type: "content",
        pageStyle: menuPage.style,
        sections: cats.map((cat) => ({ categoryName: cat.name, items: cat.items, fontScale })),
      });
    } else {
      for (const cat of cats) {
        const naturalPages = autoPageCount(cat.items.length);
        const targetPages = cat.pagesSpan && cat.pagesSpan >= 1 ? cat.pagesSpan : naturalPages;
        const itemsPerPage = Math.ceil(cat.items.length / targetPages);
        const density = itemsPerPage / MAX_ITEMS_PER_PAGE;
        const fontScale = Math.min(1.3, Math.max(0.65, 1 / density));

        for (let p = 0; p < targetPages; p++) {
          const start = p * itemsPerPage;
          const chunk = cat.items.slice(start, start + itemsPerPage);
          if (chunk.length === 0) {
            pages.push({
              type: "content",
              pageStyle: menuPage.style,
              sections: [{ categoryName: cat.name, items: [], fontScale: 1.3 }],
            });
          } else {
            pages.push({
              type: "content",
              pageStyle: menuPage.style,
              sections: [{ categoryName: cat.name, items: chunk, fontScale }],
            });
          }
        }
      }
    }
  }

  if (menu.footer && pages.length > 1) {
    const lastContent = pages[pages.length - 1];
    if (lastContent.type === "content") {
      lastContent.footerText = menu.footer;
    }
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
              {menu.logoUrl ? (
                <img src={menu.logoUrl} alt={menu.restaurantName} className="max-h-32 max-w-[80%] object-contain" />
              ) : (
                <h1 className="font-display text-5xl font-semibold text-menu-title tracking-wide leading-tight">
                  {menu.restaurantName}
                </h1>
              )}
              {menu.subtitle && (
                <p className="font-menu text-2xl text-menu-subtitle mt-3 italic tracking-widest">{menu.subtitle}</p>
              )}
              <div className="menu-ornament w-40 my-8" />
              {menu.seasonLabel && (
                <p className="font-menu text-lg text-menu-subtitle tracking-[0.3em] uppercase">{menu.seasonLabel}</p>
              )}
              {menu.description && (
                <p className="font-menu text-base text-menu-description mt-8 max-w-md leading-relaxed italic">
                  {menu.description}
                </p>
              )}
              <div className="menu-ornament-thick w-24 mt-10" />
            </div>
          )}

          {page.type === "content" && page.sections && !page.columns && (
            <div
              style={{
                ...contentStyle,
                ...(page.pageStyle?.fontFamily ? { fontFamily: page.pageStyle.fontFamily } : {}),
              }}
              className="flex flex-col justify-start h-full"
            >
              <div className="flex-1 flex flex-col">
                {page.sections.map((section, si) => {
                  const ps = page.pageStyle?.fontSize ?? 1;
                  const effectiveScale = section.fontScale * ps;
                  return (
                    <div key={si} className="flex-1 flex flex-col">
                      <div className="text-center mb-6 pt-2">
                        <div className="menu-ornament w-16 mx-auto mb-4" />
                        <h2
                          className="font-display font-semibold text-menu-title tracking-wide"
                          style={{
                            fontSize: `${1.5 * effectiveScale}rem`,
                            ...(page.pageStyle?.color ? { color: `hsl(${page.pageStyle.color})` } : {}),
                            ...(page.pageStyle?.fontFamily ? { fontFamily: page.pageStyle.fontFamily } : {}),
                          }}
                        >
                          {section.categoryName}
                        </h2>
                        <div className="menu-ornament w-16 mx-auto mt-4" />
                      </div>
                      <div
                        className="flex-1"
                        style={{ gap: `${1 * effectiveScale}rem`, display: "flex", flexDirection: "column" }}
                      >
                        {section.items.map((item) => (
                          <MenuItemRow
                            key={item.id}
                            item={item}
                            fontScale={effectiveScale}
                            isSelected={selectedItemId === item.id}
                            onClick={() => onSelectItem?.(item.id)}
                            pageStyle={page.pageStyle}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {page.footerText && (
                <div className="mt-auto pt-4 border-t border-menu-divider/30">
                  <p className="font-menu text-sm text-menu-description text-center leading-relaxed italic">
                    {page.footerText}
                  </p>
                </div>
              )}
            </div>
          )}

          {page.type === "content" && page.sections && page.columns && page.columns >= 2 && (
            <div style={contentStyle} className="flex flex-col h-full">
              <div
                className="flex-1"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${page.columns}, 1fr)`,
                  gap: `0 ${16 * (page.sections[0]?.fontScale || 0.7)}px`,
                }}
              >
                {page.sections.map((section, si) => (
                  <div key={si} className="flex flex-col">
                    <div className="text-center mb-3 pt-1">
                      <div className="menu-ornament w-10 mx-auto mb-2" />
                      <h2
                        className="font-display font-semibold text-menu-title tracking-wide"
                        style={{ fontSize: `${1.2 * section.fontScale}rem` }}
                      >
                        {section.categoryName}
                      </h2>
                      <div className="menu-ornament w-10 mx-auto mt-2" />
                    </div>
                    <div style={{ gap: `${0.5 * section.fontScale}rem`, display: "flex", flexDirection: "column" }}>
                      {section.items.map((item) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          fontScale={section.fontScale}
                          isSelected={selectedItemId === item.id}
                          onClick={() => onSelectItem?.(item.id)}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {page.footerText && (
                <div className="mt-auto pt-4 border-t border-menu-divider/30" style={{ gridColumn: `1 / -1` }}>
                  <p className="font-menu text-sm text-menu-description text-center leading-relaxed italic">
                    {page.footerText}
                  </p>
                </div>
              )}
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

function MenuPageContainer({
  children,
  widthPx,
  heightPx,
}: {
  children: React.ReactNode;
  widthPx: number;
  heightPx: number;
}) {
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
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}

function MenuItemRow({
  item,
  fontScale,
  isSelected,
  onClick,
  compact,
  pageStyle,
}: {
  item: MenuItem;
  fontScale: number;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
  pageStyle?: PageStyle;
}) {
  const nameSize = (compact ? 12 : 15) * fontScale;
  const descSize = (compact ? 10 : 13) * fontScale;
  const priceSize = (compact ? 11 : 14) * fontScale;
  const metaSize = (compact ? 9 : 12) * fontScale;
  const tagSize = (compact ? 7 : 9) * fontScale;
  const allergenSize = (compact ? 7 : 9) * fontScale;
  const py = (compact ? 3 : 8) * fontScale;
  const px = (compact ? 4 : 12) * fontScale;
  const titleColor = pageStyle?.color ? { color: `hsl(${pageStyle.color})` } : {};
  const fontFam = pageStyle?.fontFamily ? { fontFamily: pageStyle.fontFamily } : {};

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded transition-all duration-200 ${
        isSelected ? "bg-accent/10 ring-1 ring-accent/30" : "hover:bg-accent/5"
      }`}
      style={{ padding: `${py}px ${px}px` }}
    >
      {!compact && item.tags.length > 0 && (
        <div data-badge-container className="flex gap-1.5 mb-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              data-badge="tag"
              className="font-body font-semibold uppercase tracking-widest bg-menu-tag-bg text-menu-tag-text rounded-sm inline-flex items-center justify-center"
              style={{ fontSize: tagSize, padding: `${3 * fontScale}px ${8 * fontScale}px`, lineHeight: 1 }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-1">
        <h3
          className="font-menu font-semibold text-menu-title leading-snug"
          style={{ fontSize: nameSize, lineHeight: compact ? 1.2 : undefined, ...titleColor, ...fontFam }}
        >
          {item.name}
        </h3>
        <div className="border-b border-dotted border-menu-divider/50 flex-1 min-w-[8px] mx-0.5 mb-0.5" />
        <span className="font-body font-semibold text-menu-price whitespace-nowrap" style={{ fontSize: priceSize }}>
          {item.price}
        </span>
      </div>

      {!compact && item.halfPrice && (
        <p className="font-body text-menu-description ml-0" style={{ fontSize: metaSize, marginTop: 2 * fontScale }}>
          ½ ración: {item.halfPrice}
        </p>
      )}

      {!compact && item.unit && (
        <p className="font-body text-menu-description" style={{ fontSize: metaSize, marginTop: 2 * fontScale }}>
          {item.unit}
        </p>
      )}

      {!compact && item.description && (
        <p
          className="font-menu text-menu-description italic leading-relaxed"
          style={{ fontSize: descSize, marginTop: 4 * fontScale }}
        >
          {item.description}
        </p>
      )}

      {/* Alérgenos — data-badge permite al exportPDF corregir alineación en el clon */}
      {!compact && item.allergens.length > 0 && (
        <div data-badge-container className="flex flex-wrap gap-1" style={{ marginTop: 6 * fontScale }}>
          {item.allergens.map((a) => (
            <span
              key={a}
              data-badge="allergen"
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
