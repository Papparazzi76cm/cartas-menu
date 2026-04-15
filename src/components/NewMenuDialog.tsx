import { useState } from "react";
import { MenuData, PAGE_FORMATS, PageFormat } from "@/types/menu";
import { MENU_THEMES, MenuTheme, createBlankMenu } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilePlus2, Check } from "lucide-react";

interface NewMenuDialogProps {
  onCreate: (menu: MenuData) => void;
}

export function NewMenuDialog({ onCreate }: NewMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [format, setFormat] = useState<PageFormat>("A4");
  const [selectedTheme, setSelectedTheme] = useState<string>(MENU_THEMES[0].id);

  const theme = MENU_THEMES.find((t) => t.id === selectedTheme) || MENU_THEMES[0];

  const handleCreate = () => {
    const menu = createBlankMenu(name, format, theme);
    onCreate(menu);
    setOpen(false);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <FilePlus2 className="w-3.5 h-3.5" />
          Plantillas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nueva carta</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 pt-2">
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Nombre del restaurante</label>
            <Input
              placeholder="Mi Restaurante"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Format */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Formato de página</label>
            <Select value={format} onValueChange={(v) => setFormat(v as PageFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAGE_FORMATS).map(([key, f]) => (
                  <SelectItem key={key} value={key}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Estilo visual</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MENU_THEMES.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  isSelected={selectedTheme === t.id}
                  onSelect={() => setSelectedTheme(t.id)}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleCreate} className="w-full" disabled={!name.trim()}>
            Crear carta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ThemeCard({ theme, isSelected, onSelect }: { theme: MenuTheme; isSelected: boolean; onSelect: () => void }) {
  const bgColor = `hsl(${theme.colors.menuBg})`;
  const titleColor = `hsl(${theme.colors.menuTitle})`;
  const subtitleColor = `hsl(${theme.colors.menuSubtitle})`;
  const ornamentColor = `hsl(${theme.colors.menuOrnament})`;
  const priceColor = `hsl(${theme.colors.menuPrice})`;
  const descColor = `hsl(${theme.colors.menuDescription})`;
  const dividerColor = `hsl(${theme.colors.menuDivider})`;

  return (
    <button
      onClick={onSelect}
      className={`relative rounded-lg border-2 p-3 text-left transition-all ${
        isSelected ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
          <Check className="w-3 h-3 text-accent-foreground" />
        </div>
      )}

      {/* Mini preview */}
      <div
        className="rounded-md p-3 mb-2 border"
        style={{ backgroundColor: bgColor, borderColor: dividerColor }}
      >
        <div className="w-12 h-[1px] mx-auto mb-2" style={{ background: `linear-gradient(90deg, transparent, ${ornamentColor}, transparent)` }} />
        <div className="text-center text-xs font-semibold mb-0.5" style={{ color: titleColor, fontFamily: theme.fonts.display }}>
          Restaurante
        </div>
        <div className="text-center text-[9px] italic mb-2" style={{ color: subtitleColor, fontFamily: theme.fonts.menu }}>
          Carta
        </div>
        <div className="w-8 h-[1px] mx-auto mb-2" style={{ background: `linear-gradient(90deg, transparent, ${ornamentColor}, transparent)` }} />

        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[8px] font-medium" style={{ color: titleColor, fontFamily: theme.fonts.menu }}>Plato ejemplo</span>
          <span className="text-[8px] font-semibold" style={{ color: priceColor }}>18€</span>
        </div>
        <div className="text-[7px] italic" style={{ color: descColor, fontFamily: theme.fonts.menu }}>
          Descripción del plato
        </div>
      </div>

      <p className="text-xs font-semibold">{theme.name}</p>
      <p className="text-[10px] text-muted-foreground">{theme.description}</p>
    </button>
  );
}
