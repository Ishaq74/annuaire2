// src/content/loaders.ts
// FICHIER COMPLET

import { supabase } from '@lib/supabase';

// Cette fonction est appelée une seule fois par Astro au moment de la construction du site.
export async function supabaseLoader() {
    console.log("Chargement de TOUTES les données depuis Supabase pour la construction du site...");

    const [
        categoriesRes,
        articlesRes,
        authorsRes,
        relatedArticlesRes,
        commentsRes
    ] = await Promise.all([
        supabase.from('categories').select('*, category_translations(*)'),
        supabase.from('article_details_view').select('*').eq('status', 'published').is('article_deleted_at', null),
        supabase.from('authors').select('*, author_translations(*)'),
        supabase.from('article_related_articles').select('*'),
        supabase.from('comments').select('*').eq('status', 'approved')
    ]);

    // On joint les données manuellement ici, c'est plus robuste
    const articlesData = articlesRes.data?.map(article => {
        const related = relatedArticlesRes.data?.filter(r => r.article_id === article.article_id).map(r => r.related_article_id) ?? [];
        const comments = commentsRes.data?.filter(c => c.article_id === article.article_id) ?? [];
        return { ...article, related_ids: related, comments };
    }) ?? [];

    return {
        categories: categoriesRes.data ?? [],
        articles: articlesData,
        authors: authorsRes.data ?? [],
    };
}