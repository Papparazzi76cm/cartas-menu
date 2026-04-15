import { useState, useEffect } from "react";
import { MenuData } from "@/types/menu";
import { SavedMenu, saveMenu, updateMenu, listMenus, deleteMenu, loadMenu } from "@/lib/menuStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, FolderOpen, Trash2, Clock, FileText, Share2 } from "lucide-react";

interface SaveMenuDialogProps {
  menu: MenuData;
  currentMenuId: string | null;
  onSaved: (saved: SavedMenu) => void;
}

export function SaveMenuButton({ menu, currentMenuId, onSaved }: SaveMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(menu.restaurantName || "Mi Carta");
  const [saving, setSaving] = useState(false);

  const handleSave = async (asNew: boolean) => {
    setSaving(true);
    try {
      let saved: SavedMenu;
      if (currentMenuId && !asNew) {
        saved = await updateMenu(currentMenuId, name, menu);
        toast.success("Carta actualizada");
      } else {
        saved = await saveMenu(name, menu);
        toast.success("Carta guardada");
      }
      onSaved(saved);
      setOpen(false);
    } catch (err) {
      toast.error("Error al guardar la carta");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Save className="w-3.5 h-3.5" />
          Guardar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Guardar carta</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <Input
            placeholder="Nombre de la carta"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            {currentMenuId && (
              <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving}>
                Actualizar
              </Button>
            )}
            <Button size="sm" onClick={() => handleSave(true)} disabled={saving || !name.trim()}>
              {currentMenuId ? "Guardar como nueva" : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LoadMenuDialogProps {
  onLoad: (menu: MenuData, id: string) => void;
}

export function LoadMenuButton({ onLoad }: LoadMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const [menus, setMenus] = useState<SavedMenu[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      listMenus()
        .then(setMenus)
        .catch(() => toast.error("Error al cargar cartas"))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleLoad = async (id: string) => {
    try {
      const saved = await loadMenu(id);
      onLoad(saved.menu_data, saved.id);
      toast.success("Carta cargada");
      setOpen(false);
    } catch {
      toast.error("Error al cargar la carta");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenu(id);
      setMenus((prev) => prev.filter((m) => m.id !== id));
      toast.success("Carta eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <FolderOpen className="w-3.5 h-3.5" />
          Cargar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cartas guardadas</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2 max-h-[400px] overflow-y-auto">
          {loading && <p className="text-sm text-muted-foreground text-center py-8">Cargando…</p>}
          {!loading && menus.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No hay cartas guardadas</p>
          )}
          {menus.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
            >
              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(m.updated_at)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleLoad(m.id)}>
                  Abrir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const shareUrl = `${window.location.origin}/?menu=${m.id}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: m.name,
                          text: `Carta: ${m.name}`,
                          url: shareUrl,
                        });
                      } catch (err) {
                        if ((err as Error).name !== "AbortError") {
                          toast.error("Error al compartir");
                        }
                      }
                    } else {
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success("Enlace copiado al portapapeles");
                    }
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(m.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
