import { supabase } from "@/integrations/supabase/client";
import { MenuData } from "@/types/menu";

export interface SavedMenu {
  id: string;
  name: string;
  menu_data: MenuData;
  created_at: string;
  updated_at: string;
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Debes iniciar sesión para gestionar tus cartas");
  return data.user.id;
}

export async function saveMenu(name: string, menuData: MenuData): Promise<SavedMenu> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("saved_menus" as any)
    .insert({ name, menu_data: menuData as any, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as any as SavedMenu;
}

export async function updateMenu(id: string, name: string, menuData: MenuData): Promise<SavedMenu> {
  await requireUserId();
  const { data, error } = await supabase
    .from("saved_menus" as any)
    .update({ name, menu_data: menuData as any, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any as SavedMenu;
}

export async function listMenus(): Promise<SavedMenu[]> {
  const { data, error } = await supabase
    .from("saved_menus" as any)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []) as any as SavedMenu[];
}

export async function deleteMenu(id: string): Promise<void> {
  const { error } = await supabase
    .from("saved_menus" as any)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function loadMenu(id: string): Promise<SavedMenu> {
  const { data, error } = await supabase
    .from("saved_menus" as any)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as any as SavedMenu;
}
