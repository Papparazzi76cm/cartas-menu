import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MenuData } from "@/types/menu";

const state: { rows: any[]; listError: any; rpc: any } = { rows: [], listError: null, rpc: null };

vi.mock("@/integrations/supabase/client", () => {
  const chain = (op: string, payload?: any) => {
    let id: string | undefined;
    const api: any = {
      select: () => api,
      order: () => Promise.resolve(state.listError ? { data: null, error: state.listError } : { data: state.rows, error: null }),
      eq: (_c: string, v: string) => { id = v; return api; },
      single: () => {
        if (op === "insert") {
          const row = JSON.parse(JSON.stringify({ id: "m1", ...payload }));
          state.rows.push(row);
          return Promise.resolve({ data: row, error: null });
        }
        const row = state.rows.find((r) => r.id === id);
        if (op === "update") Object.assign(row, JSON.parse(JSON.stringify(payload)));
        return Promise.resolve({ data: row, error: null });
      },
    };
    return api;
  };
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: "u1" } }, error: null }) },
      from: () => ({
        insert: (p: any) => chain("insert", p),
        update: (p: any) => chain("update", p),
        select: () => chain("select").select(),
      }),
      rpc: (...a: any[]) => state.rpc(...a),
    },
  };
});

import { saveMenu, updateMenu, loadMenu, listMenus, claimLegacyMenus } from "@/lib/menuStorage";

const menu: MenuData = {
  restaurantName: "Los Molinos",
  pageFormat: "Custom230",
  themeId: "burdeos-noir",
  footer: "IVA incluido",
  pages: [{ id: "p1", title: "Carnes", columns: 1, style: { fontSize: 0.9 }, categories: [
    { id: "c1", name: "Asados", pagesSpan: 2, items: [
      { id: "i1", name: "Cordero", price: "24,50 €", halfPrice: "13 €", allergens: ["Gluten"], tags: ["Casa"] },
    ] },
  ] }],
};

describe("menuStorage", () => {
  beforeEach(() => { state.rows = []; state.listError = null; });

  it("guardar, actualizar y cargar conservan el JSON íntegro", async () => {
    const saved = await saveMenu("Carta", menu);
    expect(saved.menu_data).toEqual(menu);
    const edited = { ...menu, themeId: "costa-marina", pageFormat: "A5" as const };
    await updateMenu(saved.id, "Carta 2", edited);
    const loaded = await loadMenu(saved.id);
    expect(loaded.menu_data).toEqual(edited);
    expect(loaded.menu_data.pages[0].categories[0].items[0].price).toBe("24,50 €");
  });

  it("un fallo de red lanza error en vez de devolver lista vacía", async () => {
    state.listError = { message: "Failed to fetch" };
    await expect(listMenus()).rejects.toMatchObject({ message: "Failed to fetch" });
  });

  it("recuperar llama a la función y propaga errores reales", async () => {
    state.rpc = vi.fn().mockResolvedValue({ data: 3, error: null });
    expect(await claimLegacyMenus("  abcdefabcdefabcdef  ")).toBe(3);
    expect(state.rpc).toHaveBeenCalledWith("claim_legacy_menus", { recovery_code: "abcdefabcdefabcdef" });
    state.rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "Código no válido o ya utilizado" } });
    await expect(claimLegacyMenus("abcdefabcdefabcdef")).rejects.toThrow("ya utilizado");
  });
});
