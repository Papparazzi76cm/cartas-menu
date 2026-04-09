import { useState } from "react";
import { MenuData, MenuItem, MenuCategory, ALLERGEN_LIST, PAGE_FORMATS, PageFormat } from "@/types/menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical, FileText, Settings, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EditorPanelProps {
  menu: MenuData;
  onChange: (menu: MenuData) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

export function EditorPanel({ menu, onChange, selectedItemId, onSelectItem }: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<"content" | "settings">("content");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
    const pages = [...menu.pages];
    const page = { ...pages[pageIdx] };
    const cats = [...page.categories];
    const cat = { ...cats[catIdx] };
    const items = [...cat.items];
    items[itemIdx] = { ...items[itemIdx], ...updates };
    cat.items = items;
    cats[catIdx] = cat;
    page.categories = cats;
    pages[pageIdx] = page;
    onChange({ ...menu, pages });
  };

  const addItem = (pageIdx: number, catIdx: number) => {
    const pages = [...menu.pages];
    const page = { ...pages[pageIdx] };
    const cats = [...page.categories];
    const cat = { ...cats[catIdx] };
    cat.items = [...cat.items, {
      id: Math.random().toString(36).slice(2, 10),
      name: "Nuevo plato",
      price: "0€",
      allergens: [],
      tags: [],
    }];
    cats[catIdx] = cat;
    page.categories = cats;
    pages[pageIdx] = page;
    onChange({ ...menu, pages });
  };

  const deleteItem = (pageIdx: number, catIdx: number, itemIdx: number) => {
    const pages = [...menu.pages];
    const page = { ...pages[pageIdx] };
    const cats = [...page.categories];
    const cat = { ...cats[catIdx] };
    cat.items = cat.items.filter((_, i) => i !== itemIdx);
    cats[catIdx] = cat;
    page.categories = cats;
    pages[pageIdx] = page;
    onChange({ ...menu, pages });
  };

  const addCategory = (pageIdx: number) => {
    const pages = [...menu.pages];
    const page = { ...pages[pageIdx] };
    page.categories = [...page.categories, {
      id: Math.random().toString(36).slice(2, 10),
      name: "Nueva categoría",
      items: [],
    }];
    pages[pageIdx] = page;
    onChange({ ...menu, pages });
  };

  const addPage = () => {
    onChange({
      ...menu,
      pages: [...menu.pages, {
        id: Math.random().toString(36).slice(2, 10),
        title: "Nueva página",
        categories: [],
      }],
    });
  };

  const selectedItem = (() => {
    for (let pi = 0; pi < menu.pages.length; pi++) {
      for (let ci = 0; ci < menu.pages[pi].categories.length; ci++) {
        for (let ii = 0; ii < menu.pages[pi].categories[ci].items.length; ii++) {
          if (menu.pages[pi].categories[ci].items[ii].id === selectedItemId) {
            return { pi, ci, ii, item: menu.pages[pi].categories[ci].items[ii] };
          }
        }
      }
    }
    return null;
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
                  <option key={fmt} value={fmt}>{PAGE_FORMATS[fmt].label}</option>
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
                  <button onClick={() => onSelectItem(null)} className="text-xs text-muted-foreground hover:text-foreground">✕ Cerrar</button>
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
                      onChange={(e) => updateItem(selectedItem.pi, selectedItem.ci, selectedItem.ii, { halfPrice: e.target.value || undefined })}
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
                    onChange={(e) => updateItem(selectedItem.pi, selectedItem.ci, selectedItem.ii, { tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  />
                </div>
              </motion.div>
            )}

            {/* Pages tree */}
            {menu.pages.map((page, pi) => (
              <div key={page.id} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-3 py-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground flex-1">{page.title || `Página ${pi + 1}`}</span>
                </div>
                {page.categories.map((cat, ci) => {
                  const isExpanded = expandedCategories.has(cat.id);
                  return (
                    <div key={cat.id} className="border-t border-border/50">
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-editor-hover transition-colors text-left"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                        <span className="text-xs font-medium text-foreground flex-1">{cat.name}</span>
                        <span className="text-[10px] text-muted-foreground">{cat.items.length}</span>
                      </button>
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
                              <div
                                key={item.id}
                                onClick={() => onSelectItem(item.id)}
                                className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer transition-colors ${
                                  selectedItemId === item.id ? "bg-accent/10 text-accent" : "hover:bg-editor-hover text-foreground"
                                }`}
                              >
                                <GripVertical className="w-3 h-3 text-muted-foreground/40" />
                                <span className="text-xs flex-1 truncate">{item.name}</span>
                                <span className="text-[10px] text-muted-foreground">{item.price}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteItem(pi, ci, ii); }}
                                  className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addItem(pi, ci)}
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
            <Button variant="outline" size="sm" onClick={addPage} className="w-full">
              <Plus className="w-3.5 h-3.5 mr-1" /> Añadir página
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
