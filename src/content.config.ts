// src/content/loaders.ts
// FICHIER COMPLET

import { prisma } from '@lib/prisma';

// Cette fonction est appelée une seule fois par Astro au moment de la construction du site.
export async function prismaLoader() {
    console.log("Chargement de TOUTES les données depuis Prisma pour la construction du site...");

    const [
        categoriesRes,
        articlesRes,
        authorsRes,
        relatedArticlesRes,
        commentsRes
    ] = await Promise.all([
        prisma.category.findMany({
            include: {
                translations: true
            }
        }),
        prisma.article.findMany({
            where: {
                status: 'published',
                deletedAt: null
            },
            include: {
                translations: true,
                author: {
                    include: {
                        profile: true
                    }
                },
                category: {
                    include: {
                        translations: true
                    }
                }
            }
        }),
        prisma.user.findMany({
            include: {
                profile: true
            }
        }),
        prisma.articleRelation.findMany(),
        prisma.comment.findMany({
            where: {
                status: 'approved',
                deletedAt: null
            }
        })
    ]);

    // On joint les données manuellement ici, c'est plus robuste
    const articlesData = articlesRes.map(article => {
        const related = relatedArticlesRes.filter(r => r.articleId === article.id).map(r => r.relatedArticleId) ?? [];
        const comments = commentsRes.filter(c => c.articleId === article.id) ?? [];
        return { ...article, related_ids: related, comments };
    }) ?? [];

    return {
        categories: categoriesRes ?? [],
        articles: articlesData,
        authors: authorsRes ?? [],
    };
}