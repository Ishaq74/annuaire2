// src/lib/menu.ts (exemple)
import { prisma } from "./prisma"; // Votre client prisma

// Type pour combiner la catégorie et sa traduction
export interface MenuCategory {
  id: string;
  slug: string;
  iconName: string | null;
  isActive: boolean;
  displayOrder: number | null;
  parentId: string | null;
  translation: {
    name: string;
    description: string | null;
    seoSlug: string;
  };
}

export async function getMenuItems(lang: string): Promise<MenuCategory[]> {
  // On récupère les catégories avec leurs traductions
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      translations: {
        some: {
          langCode: lang
        }
      }
    },
    include: {
      translations: {
        where: {
          langCode: lang
        }
      }
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });

  // On transforme les données pour correspondre à l'interface
  return categories
    .filter(item => item.translations.length > 0)
    .map(item => ({
      id: item.id,
      slug: item.slug,
      iconName: item.iconName,
      isActive: item.isActive,
      displayOrder: item.displayOrder,
      parentId: item.parentId,
      translation: {
        name: item.translations[0].name,
        description: item.translations[0].description,
        seoSlug: item.translations[0].seoSlug
      }
    }));
}