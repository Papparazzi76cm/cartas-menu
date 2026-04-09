import { MenuData, MenuCategory, MenuItem } from "@/types/menu";
import { motion } from "framer-motion";

interface MenuPreviewProps {
  menu: MenuData;
  selectedItemId?: string | null;
  onSelectItem?: (id: string) => void;
}

export function MenuPreview({ menu, selectedItemId, onSelectItem }: MenuPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Cover Page */}
      <MenuPageContainer>
        <div className="flex flex-col items-center justify-center h-full text-center px-12">
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
      </MenuPageContainer>

      {/* Content Pages */}
      {menu.pages.map((page) => (
        <MenuPageContainer key={page.id}>
          <div className="px-10 py-10">
            {page.categories.map((cat, ci) => (
              <div key={cat.id} className={ci > 0 ? "mt-10" : ""}>
                <div className="text-center mb-6">
                  <div className="menu-ornament w-16 mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-semibold text-menu-title tracking-wide">
                    {cat.name}
                  </h2>
                  <div className="menu-ornament w-16 mx-auto mt-4" />
                </div>
                <div className="space-y-4">
                  {cat.items.map((item) => (
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
        </MenuPageContainer>
      ))}

      {/* Footer Page */}
      {menu.footer && (
        <MenuPageContainer>
          <div className="flex items-center justify-center h-full px-12">
            <p className="font-menu text-sm text-menu-description text-center leading-relaxed italic">
              {menu.footer}
            </p>
          </div>
        </MenuPageContainer>
      )}
    </div>
  );
}

function MenuPageContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-menu-page
      className="bg-menu-bg w-[595px] min-h-[842px] shadow-xl rounded-sm border border-border/50 relative overflow-hidden flex flex-col"
      style={{ aspectRatio: "210/297" }}
    >
      {/* Subtle border frame */}
      <div className="absolute inset-3 border border-menu-divider/30 pointer-events-none rounded-sm" />
      <div className="flex-1 flex flex-col justify-center relative z-10">
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
      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex gap-1.5 mb-1">
          {item.tags.map((tag) => (
            <span key={tag} className="font-body text-[9px] font-semibold uppercase tracking-widest bg-menu-tag-bg text-menu-tag-text px-2 py-0.5 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Name + Price row */}
      <div className="flex items-baseline gap-2">
        <h3 className="font-menu text-[15px] font-semibold text-menu-title flex-1 leading-snug">
          {item.name}
        </h3>
        <div className="flex-shrink-0 border-b border-dotted border-menu-divider/50 flex-1 min-w-[20px] mx-1 mb-1" />
        <span className="font-body text-sm font-semibold text-menu-price whitespace-nowrap">
          {item.price}
        </span>
      </div>

      {/* Half price */}
      {item.halfPrice && (
        <p className="font-body text-xs text-menu-description ml-0 mt-0.5">
          ½ ración: {item.halfPrice}
        </p>
      )}

      {/* Unit */}
      {item.unit && (
        <p className="font-body text-xs text-menu-description mt-0.5">{item.unit}</p>
      )}

      {/* Description */}
      {item.description && (
        <p className="font-menu text-[13px] text-menu-description italic mt-1 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Allergens */}
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
