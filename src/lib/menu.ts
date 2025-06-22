// src/lib/menu.ts (exemple)
import { supabase } from "./supabase"; // Votre client supabase
import type { Category, CategoryTranslation } from "../env"; // Définissez vos types

// Type pour combiner la catégorie et sa traduction
export interface MenuCategory extends Category {
  translation: CategoryTranslation;
}

export async function getMenuItems(lang: string): Promise<MenuCategory[]> {
  // On récupère les catégories et on fait une JOINTURE
  // pour n'avoir QUE la traduction pour la langue demandée.
  const { data, error } = await supabase
    .from("categories")
    .select(`
      *,
      category_translations!inner(
        name,
        description,
        seo_slug
      )
    `)
    .eq("is_active", true)
    .eq("category_translations.lang_code", lang)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Erreur lors de la récupération du menu:", error);
    return [];
  }
  
  // Supabase retourne la traduction dans un tableau, on l'aplatit.
  return data.map(item => ({
      ...item,
      translation: item.category_translations[0] 
  }));
}