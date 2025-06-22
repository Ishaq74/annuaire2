/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export interface Category {
  id: number;
  is_active: boolean;
  display_order: number;
  // Ajoutez d'autres champs selon votre schéma
  category_translations: CategoryTranslation[];
}

export interface CategoryTranslation {
  name: string;
  description: string;
  seo_slug: string;
  lang_code: string;
  // Ajoutez d'autres champs selon votre schéma
}