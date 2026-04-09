import { useState, useMemo } from "react";
import { MenuData, MenuItem, MenuCategory, ALLERGEN_LIST, PAGE_FORMATS, PageFormat, PageStyle } from "@/types/menu";
import { MENU_THEMES } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical, FileText, Settings, Layers, Palette, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface EditorPanelProps {
  menu: MenuData;
  onChange: (menu: MenuData) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

// Helper: locate an item across the whole menu by its id
function findItemLocation(menu: MenuData, itemId: string) {
  for (let pi = 0; pi < menu.pages.length; pi++) {
    for (let ci = 0; ci < menu.pages[pi].categories.length; ci++) {
      const ii = menu.pages[pi].categories[ci].items.findIndex((it) => it.id === itemId);
      if (ii !== -1) return { pi, ci, ii };
    }
  }
  return null;
}

// Helper: locate a category across the whole menu
function findCatLocation(menu: MenuData, catId: string) {
  for (let pi = 0; pi < menu.pages.length; pi++) {
    const ci = menu.pages[pi].categories.findIndex((c) => c.id === catId);
    if (ci !== -1) return { pi, ci };
  }
  return null;
}

// Deep clone pages helper
function clonePages(menu: MenuData) {
  return menu.pages.map((p) => ({
    ...p,
    categories: p.categories.map((c) => ({ ...c, items: [...c.items] })),
  }));
}

// ---------- Sortable Item Row ----------
function SortableItemRow({
  item,
  isSelected,
  onClick,
  onDelete,
}: {
  item: MenuItem;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: "item", item },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer transition-colors group ${
        isSelected ? "bg-accent/10 text-accent" : "hover:bg-editor-hover text-foreground"
      }`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="w-3 h-3 text-muted-foreground/40" />
      </button>
      <span className="text-xs flex-1 truncate">{item.name}</span>
      <span className="text-[10px] text-muted-foreground">{item.price}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ---------- Sortable Category ----------
function SortableCategoryHeader({
  cat,
  isExpanded,
  onToggle,
  onRename,
  onChangePagesSpan,
  onDelete,
}: {
  cat: MenuCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onChangePagesSpan: (span: number | undefined) => void;
  onDelete: () => void;
}) {
  isExpanded: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onChangePagesSpan: (span: number | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(cat.name);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `cat-${cat.id}`,
    data: { type: "category", cat },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== cat.name) onRename(trimmed);
    else setEditName(cat.name);
    setEditing(false);
  };

  const autoPages = cat.items.length === 0 ? 1 : Math.ceil(cat.items.length / 6);

  return (
    <div ref={setNodeRef} style={style} className="border-t border-border/50">
      <div className="w-full flex items-center gap-2 px-3 py-2 hover:bg-editor-hover transition-colors text-left">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
        </button>
        <button onClick={onToggle} className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
        {editing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setEditName(cat.name); setEditing(false); }
            }}
            className="text-xs font-medium text-foreground flex-1 bg-background border border-input rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <span
            className="text-xs font-medium text-foreground flex-1 cursor-text truncate"
            onDoubleClick={() => { setEditName(cat.name); setEditing(true); }}
          >
            {cat.name}
          </span>
        )}
        {/* Page span selector */}
        <select
          value={cat.pagesSpan ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChangePagesSpan(val === "" ? undefined : Number(val));
          }}
          onClick={(e) => e.stopPropagation()}
          title="Páginas que ocupa esta sección"
          className="w-14 text-[10px] text-muted-foreground bg-background border border-input rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">{autoPages}p ⚡</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n}p</option>
          ))}
        </select>
        <span className="text-[10px] text-muted-foreground">{cat.items.length}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Eliminar sección"
          className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity ml-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
    </div>
  );
}


export function EditorPanel({ menu, onChange, selectedItemId, onSelectItem }: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<"content" | "settings">("content");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateRestaurantField = (field: keyof MenuData, value: string) => {
    onChange({ ...menu, [field]: value });
  };

  const updateItem = (pageIdx: number, catIdx: number, itemIdx: number, updates: Partial<MenuItem>) => {
    const pages = clonePages(menu);
    pages[pageIdx].categories[catIdx].items[itemIdx] = {
      ...pages[pageIdx].categories[catIdx].items[itemIdx],
      ...updates,
    };
    onChange({ ...menu, pages });
  };

  const addItem = (pageIdx: number, catIdx: number) => {
    const pages = clonePages(menu);
    pages[pageIdx].categories[catIdx].items.push({
      id: Math.random().toString(36).slice(2, 10),
      name: "Nuevo plato",
      price: "0€",
      allergens: [],
      tags: [],
    });
    onChange({ ...menu, pages });
  };

  const deleteItem = (pageIdx: number, catIdx: number, itemIdx: number) => {
    const pages = clonePages(menu);
    pages[pageIdx].categories[catIdx].items.splice(itemIdx, 1);
    onChange({ ...menu, pages });
  };

  const addCategory = (pageIdx: number) => {
    const pages = clonePages(menu);
    pages[pageIdx].categories.push({
      id: Math.random().toString(36).slice(2, 10),
      name: "Nueva categoría",
      items: [],
    });
    onChange({ ...menu, pages });
  };

  const updateCategoryName = (catId: string, newName: string) => {
    const loc = findCatLocation(menu, catId);
    if (!loc) return;
    const pages = clonePages(menu);
    pages[loc.pi].categories[loc.ci].name = newName;
    onChange({ ...menu, pages });
  };

  const updateCategoryPagesSpan = (catId: string, span: number | undefined) => {
    const loc = findCatLocation(menu, catId);
    if (!loc) return;
    const pages = clonePages(menu);
    pages[loc.pi].categories[loc.ci].pagesSpan = span;
    onChange({ ...menu, pages });
  };

  const addSection = () => {
    const newCatId = Math.random().toString(36).slice(2, 10);
    const pages = clonePages(menu);
    pages.push({
      id: Math.random().toString(36).slice(2, 10),
      title: "Nueva sección",
      categories: [{ id: newCatId, name: "Nueva sección", items: [] }],
    });
    onChange({ ...menu, pages });
    setExpandedCategories((prev) => new Set(prev).add(newCatId));
  };

  const addPage = () => {
    onChange({
      ...menu,
      pages: [
        ...menu.pages,
        { id: Math.random().toString(36).slice(2, 10), title: "Nueva página", categories: [] },
      ],
    });
  };

  // All item IDs for the sortable context (flat list across all categories)
  const allItemIds = useMemo(() => {
    const ids: string[] = [];
    for (const page of menu.pages) {
      for (const cat of page.categories) {
        for (const item of cat.items) {
          ids.push(item.id);
        }
      }
    }
    return ids;
  }, [menu]);

  // All category sortable IDs
  const allCatIds = useMemo(() => {
    const ids: string[] = [];
    for (const page of menu.pages) {
      for (const cat of page.categories) {
        ids.push(`cat-${cat.id}`);
      }
    }
    return ids;
  }, [menu]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Item dragged over another item in a different category → move it there
    if (activeData?.type === "item" && overData?.type === "item") {
      const activeId = active.id as string;
      const overId = over.id as string;
      if (activeId === overId) return;

      const from = findItemLocation(menu, activeId);
      const to = findItemLocation(menu, overId);
      if (!from || !to) return;

      // Different category: move item
      if (from.pi !== to.pi || from.ci !== to.ci) {
        const pages = clonePages(menu);
        const [movedItem] = pages[from.pi].categories[from.ci].items.splice(from.ii, 1);
        pages[to.pi].categories[to.ci].items.splice(to.ii, 0, movedItem);
        onChange({ ...menu, pages });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // --- Item reorder within same category ---
    if (activeData?.type === "item") {
      const activeId = active.id as string;
      const overId = over.id as string;

      const from = findItemLocation(menu, activeId);
      const to = findItemLocation(menu, overId);

      if (from && to && from.pi === to.pi && from.ci === to.ci) {
        const pages = clonePages(menu);
        pages[from.pi].categories[from.ci].items = arrayMove(
          pages[from.pi].categories[from.ci].items,
          from.ii,
          to.ii
        );
        onChange({ ...menu, pages });
      }
      // Cross-category moves already handled in onDragOver
      return;
    }

    // --- Category reorder ---
    if (activeData?.type === "category") {
      const activeCatId = (active.id as string).replace("cat-", "");
      const overCatId = (over.id as string).replace("cat-", "");

      const from = findCatLocation(menu, activeCatId);
      const to = findCatLocation(menu, overCatId);
      if (!from || !to) return;

      const pages = clonePages(menu);

      if (from.pi === to.pi) {
        // Same page: reorder
        pages[from.pi].categories = arrayMove(pages[from.pi].categories, from.ci, to.ci);
      } else {
        // Cross-page: move category
        const [movedCat] = pages[from.pi].categories.splice(from.ci, 1);
        pages[to.pi].categories.splice(to.ci, 0, movedCat);
      }
      onChange({ ...menu, pages });
    }
  };

  const selectedItem = (() => {
    const loc = selectedItemId ? findItemLocation(menu, selectedItemId) : null;
    if (!loc) return null;
    return { ...loc, item: menu.pages[loc.pi].categories[loc.ci].items[loc.ii] };
  })();

  return (
    <div className="flex flex-col h-full bg-editor-sidebar">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "content" ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-4 h-4" /> Contenido
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "settings" ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" /> Ajustes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {activeTab === "settings" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Formato de página</label>
              <select
                value={menu.pageFormat}
                onChange={(e) => onChange({ ...menu, pageFormat: e.target.value as PageFormat })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {(Object.keys(PAGE_FORMATS) as PageFormat[]).map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {PAGE_FORMATS[fmt].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre del restaurante</label>
              <Input value={menu.restaurantName} onChange={(e) => updateRestaurantField("restaurantName", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subtítulo</label>
              <Input value={menu.subtitle || ""} onChange={(e) => updateRestaurantField("subtitle", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Temporada</label>
              <Input value={menu.seasonLabel || ""} onChange={(e) => updateRestaurantField("seasonLabel", e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descripción</label>
              <Textarea value={menu.description || ""} onChange={(e) => updateRestaurantField("description", e.target.value)} className="mt-1" rows={3} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pie de página</label>
              <Textarea value={menu.footer || ""} onChange={(e) => updateRestaurantField("footer", e.target.value)} className="mt-1" rows={2} />
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-3 animate-fade-in">
            {/* Item detail panel */}
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">Editando plato</span>
                  <button onClick={() => onSelectItem(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    ✕ Cerrar
                  </button>
                </div>
                <Input
                  placeholder="Nombre del plato"
                  value={selectedItem.item.name}
                  onChange={(e) => updateItem(selectedItem.pi, selectedItem.ci, selectedItem.ii, { name: e.target.value })}
                />
                <Textarea
                  placeholder="Descripción"
                  value={selectedItem.item.description || ""}
                  onChange={(e) => updateItem(selectedItem.pi, selectedItem.ci, selectedItem.ii, { description: e.target.value })}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Precio</label>
                    <Input
                      value={selectedItem.item.price}
                      onChange={(e) => updateItem(selectedItem.pi, selectedItem.ci, selectedItem.ii, { price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase">½ Ración</label>
                    <Input
                      value={selectedItem.item.halfPrice || ""}
                      onChange={(e) =>
                        updateItem(selectedItem.pi, selectedItem.ci, selectedItem.ii, { halfPrice: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase">Alérgenos</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {ALLERGEN_LIST.map((a) => (
                      <button
                        key={a}
                        onClick={() => {
                          const current = selectedItem.item.allergens;
                          const next = current.includes(a) ? current.filter((x) => x !== a) : [...current, a];
                          updateItem(selectedItem.pi, selectedItem.ci, selectedItem.ii, { allergens: next });
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                          selectedItem.item.allergens.includes(a)
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-muted text-muted-foreground border-border hover:border-accent/50"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase">Etiquetas (separadas por coma)</label>
                  <Input
                    value={selectedItem.item.tags.join(", ")}
                    onChange={(e) =>
                      updateItem(selectedItem.pi, selectedItem.ci, selectedItem.ii, {
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </motion.div>
            )}

            {/* Pages tree with DnD */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={allCatIds} strategy={verticalListSortingStrategy}>
                <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
                  {menu.pages.map((page, pi) => (
                    <div key={page.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-3 py-2 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground flex-1">
                          {page.title || `Página ${pi + 1}`}
                        </span>
                      </div>
                      {page.categories.map((cat) => {
                        const isExpanded = expandedCategories.has(cat.id);
                        return (
                          <div key={cat.id}>
                            <SortableCategoryHeader
                              cat={cat}
                              isExpanded={isExpanded}
                              onToggle={() => toggleCategory(cat.id)}
                              onRename={(name) => updateCategoryName(cat.id, name)}
                              onChangePagesSpan={(span) => updateCategoryPagesSpan(cat.id, span)}
                            />
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  {cat.items.map((item, ii) => (
                                    <SortableItemRow
                                      key={item.id}
                                      item={item}
                                      isSelected={selectedItemId === item.id}
                                      onClick={() => onSelectItem(item.id)}
                                      onDelete={() => {
                                        const loc = findItemLocation(menu, item.id);
                                        if (loc) deleteItem(loc.pi, loc.ci, loc.ii);
                                      }}
                                    />
                                  ))}
                                  <button
                                    onClick={() => addItem(pi, page.categories.indexOf(cat))}
                                    className="w-full flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
                                  >
                                    <Plus className="w-3 h-3" /> Añadir plato
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => addCategory(pi)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-accent transition-colors border-t border-border/50"
                      >
                        <Plus className="w-3 h-3" /> Añadir categoría
                      </button>
                    </div>
                  ))}
                </SortableContext>
              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay>
                {activeDragId && !activeDragId.startsWith("cat-") && (() => {
                  const loc = findItemLocation(menu, activeDragId);
                  if (!loc) return null;
                  const item = menu.pages[loc.pi].categories[loc.ci].items[loc.ii];
                  return (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-editor-sidebar shadow-lg rounded border border-accent/30 text-foreground">
                      <GripVertical className="w-3 h-3 text-muted-foreground/40" />
                      <span className="text-xs flex-1 truncate">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.price}</span>
                    </div>
                  );
                })()}
                {activeDragId && activeDragId.startsWith("cat-") && (() => {
                  const catId = activeDragId.replace("cat-", "");
                  const loc = findCatLocation(menu, catId);
                  if (!loc) return null;
                  const cat = menu.pages[loc.pi].categories[loc.ci];
                  return (
                    <div className="flex items-center gap-2 px-3 py-2 bg-editor-sidebar shadow-lg rounded border border-accent/30 text-foreground">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
                      <span className="text-xs font-medium flex-1">{cat.name}</span>
                      <span className="text-[10px] text-muted-foreground">{cat.items.length}</span>
                    </div>
                  );
                })()}
              </DragOverlay>
            </DndContext>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addSection} className="flex-1">
                <Plus className="w-3.5 h-3.5 mr-1" /> Crear sección
              </Button>
              <Button variant="outline" size="sm" onClick={addPage} className="flex-1">
                <Plus className="w-3.5 h-3.5 mr-1" /> Añadir página
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
