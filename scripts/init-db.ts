import { prisma } from '../src/lib/prisma';
import { initializeRolesAndPermissions } from '../src/lib/permissions';

async function main() {
  console.log('🚀 Initializing database...');
  
  try {
    // Initialize roles and permissions
    await initializeRolesAndPermissions();
    
    // Create a sample magazine category if it doesn't exist
    const magazineCategory = await prisma.category.upsert({
      where: { id: 'd20b7566-105a-47f3-947f-dab773bef43e' },
      update: {},
      create: {
        id: 'd20b7566-105a-47f3-947f-dab773bef43e',
        slug: 'magazine',
        isActive: true,
        displayOrder: 1,
        iconName: 'book',
        translations: {
          create: [
            {
              langCode: 'fr',
              name: 'Magazine',
              description: 'Découvrez nos articles et actualités',
              seoSlug: 'magazine'
            },
            {
              langCode: 'en',
              name: 'Magazine',
              description: 'Discover our articles and news',
              seoSlug: 'magazine'
            },
            {
              langCode: 'es',
              name: 'Revista',
              description: 'Descubre nuestros artículos y noticias',
              seoSlug: 'revista'
            }
          ]
        }
      }
    });

    // Create sample categories
    const techCategory = await prisma.category.upsert({
      where: { slug: 'tech' },
      update: {},
      create: {
        slug: 'tech',
        parentId: magazineCategory.id,
        isActive: true,
        displayOrder: 1,
        iconName: 'computer',
        translations: {
          create: [
            {
              langCode: 'fr',
              name: 'Technologie',
              description: 'Articles sur la technologie et l\'innovation',
              seoSlug: 'technologie'
            },
            {
              langCode: 'en',
              name: 'Technology',
              description: 'Articles about technology and innovation',
              seoSlug: 'technology'
            },
            {
              langCode: 'es',
              name: 'Tecnología',
              description: 'Artículos sobre tecnología e innovación',
              seoSlug: 'tecnologia'
            }
          ]
        }
      }
    });

    console.log('✅ Database initialized successfully');
    console.log('📊 Created roles and permissions');
    console.log('📂 Created sample categories');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();