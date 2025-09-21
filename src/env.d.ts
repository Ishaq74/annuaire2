/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string
  readonly BETTER_AUTH_SECRET: string
  readonly BETTER_AUTH_URL: string
  readonly SMTP_HOST: string
  readonly SMTP_PORT: string
  readonly SMTP_USER: string
  readonly SMTP_PASS: string
  readonly SMTP_FROM: string
  readonly SMTP_FROM_NAME: string
  readonly OTP_EXPIRES_IN: string
  readonly ADMIN_EMAIL: string
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