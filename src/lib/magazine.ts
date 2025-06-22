import { supabase } from '@lib/supabase';
import { AstroError } from 'astro/errors';
import type { PostgrestError } from '@supabase/supabase-js';

// ============================================================================
// 0. CONSTANTE CENTRALE
// ============================================================================
const MAGAZINE_ROOT_ID = 'd20b7566-105a-47f3-947f-dab773bef43e';

// ============================================================================
// 1. TYPES DE DONNÉES PARTAGÉS
// ============================================================================
export interface Article {
  id: string; title: string; summary: string; content?: string; featuredImageUrl: string | null; featuredImageAlt: string | null; seoSlug: string; publicationDate: string; readTimeMinutes: number; viewCount: number;
  author: { id: string; name: string; slug: string; bio: string | null; profileImageUrl: string | null; };
  category: { id: string; name: string; seoSlug: string; iconName: string | null; };
}
export interface SidebarCategory { id: string; name: string; seoSlug: string; articlesCount: number; }
export interface Comment { id: string; author_name: string; content: string; created_at: string; children: Comment[]; }

// ============================================================================
// 2. FONCTION DE TRANSFORMATION UNIVERSELLE
// ============================================================================
function transformArticle(raw: any, lang: string): Article | null {
  if (!raw?.article_translations?.[0]) return null;
  const translation = raw.article_translations[0];
  const categoryTranslation = raw.categories?.category_translations?.find(t => t.lang_code === lang);
  const authorTranslation = raw.authors?.author_translations?.find(t => t.lang_code === lang);
  return { id: raw.id, title: translation.name, summary: translation.description, content: translation.content, featuredImageUrl: raw.featured_image_url, featuredImageAlt: translation.featured_image_alt, seoSlug: translation.seo_slug, publicationDate: raw.publication_date, readTimeMinutes: raw.read_time_minutes, viewCount: raw.view_count || 0, author: { id: raw.authors?.id, name: raw.authors?.name || 'Auteur inconnu', slug: raw.authors?.slug, bio: authorTranslation?.bio, profileImageUrl: raw.authors?.profile_image_url }, category: { id: raw.categories?.id, name: categoryTranslation?.name || 'Catégorie inconnue', seoSlug: categoryTranslation?.seo_slug || raw.categories?.slug, iconName: raw.categories?.icon_name }, };
}
const checkError = (result: { error: PostgrestError | null }, name: string) => { if (result.error) console.error(`Erreur Supabase [${name}]:`, result.error); return result.data || []; };

// ============================================================================
// 3. PAGE D'INDEX DU MAGAZINE (/fr/magazine/index.astro)
// ============================================================================
export interface MagazinePageData {
  pageTitle: string; pageDescription: string | null; pageIcon: string | null; parentCategorySlug: string;
  featuredArticles: Article[]; recentArticles: Article[]; sidebarCategories: SidebarCategory[]; sidebarPopularArticles: Article[];
}

export async function getMagazineIndexPageData(lang: string, magazineSlug: string): Promise<MagazinePageData> {
  const { data: magazineCategory, error } = await supabase.from('categories').select('id, icon_name, category_translations!inner(name, description, seo_slug)').eq('category_translations.lang_code', lang).eq('category_translations.seo_slug', magazineSlug).is('parent_id', null).single();
  if (error || !magazineCategory) throw new AstroError(`Page Not Found`, `La catégorie racine du magazine avec le slug "${magazineSlug}" est introuvable pour la langue "${lang}".`);
  
  const magazineCategoryId = magazineCategory.id;
  const magazineTranslation = magazineCategory.category_translations[0];
  const selectQuery = `id, publication_date, read_time_minutes, view_count, featured_image_url, article_translations!inner(name, description, featured_image_alt, seo_slug), authors:authors!inner(id, name, slug, profile_image_url, author_translations!inner(bio, lang_code)), categories:categories!inner(id, slug, icon_name, category_translations!inner(name, seo_slug, lang_code))`;
  
  const [catRes, featRes, recRes, popRes] = await Promise.all([
    supabase.from('categories').select(`id, slug, category_translations!inner(name, seo_slug), articles(count)`).eq('parent_id', magazineCategoryId).eq('is_active', true).eq('category_translations.lang_code', lang).order('display_order'),
    supabase.from('articles').select(selectQuery).eq('article_translations.lang_code', lang).eq('categories.parent_id', magazineCategoryId).eq('is_featured', true).order('publication_date', { ascending: false }).limit(4),
    supabase.from('articles').select(selectQuery).eq('article_translations.lang_code', lang).eq('categories.parent_id', magazineCategoryId).order('publication_date', { ascending: false }).limit(6),
    supabase.from('articles').select(selectQuery).eq('article_translations.lang_code', lang).eq('categories.parent_id', magazineCategoryId).order('view_count', { ascending: false, nulls: 'last' }).limit(5)
  ]);

  return {
    pageTitle: magazineTranslation.name, pageDescription: magazineTranslation.description, pageIcon: magazineCategory.icon_name, parentCategorySlug: magazineTranslation.seo_slug,
    sidebarCategories: checkError(catRes, 'sidebar categories').map(c => ({ id: c.id, name: c.category_translations[0].name, seoSlug: c.category_translations[0].seo_slug || c.slug, articlesCount: c.articles[0]?.count || 0 })),
    featuredArticles: checkError(featRes, 'featured articles').map(raw => transformArticle(raw, lang)).filter(Boolean) as Article[],
    recentArticles: checkError(recRes, 'recent articles').map(raw => transformArticle(raw, lang)).filter(Boolean) as Article[],
    sidebarPopularArticles: checkError(popRes, 'popular articles').map(raw => transformArticle(raw, lang)).filter(Boolean) as Article[],
  };
}

// ============================================================================
// 4. PAGE DE CATÉGORIE (/fr/magazine/[category].astro)
// ============================================================================
export interface CategoryPageData {
  category: { id: string; name: string; description: string | null; iconName: string | null; };
  parentCategory: { name: string; seoSlug: string; };
  articles: Article[]; popularArticles: Article[];
}

export async function getCategoryPageData(lang: string, categorySlug: string): Promise<CategoryPageData> {
  const { data: parentData, error: parentError } = await supabase.from('categories').select('category_translations!inner(name, seo_slug)').eq('id', MAGAZINE_ROOT_ID).eq('category_translations.lang_code', lang).single();
  if (parentError || !parentData) throw new AstroError(`Configuration Error`, `Catégorie racine Magazine introuvable pour la langue "${lang}".`);
  
  const { data: categoryData, error: catError } = await supabase.from('categories').select('id, icon_name, category_translations!inner(name, description, seo_slug)').eq('category_translations.seo_slug', categorySlug).eq('category_translations.lang_code', lang).eq('parent_id', MAGAZINE_ROOT_ID).single();
  if (catError || !categoryData) throw new AstroError(`Page Not Found`, `La catégorie "${categorySlug}" n'est pas une sous-catégorie valide du magazine.`);
  
  const selectQuery = `id, publication_date, read_time_minutes, view_count, featured_image_url, article_translations!inner(name, description, featured_image_alt, seo_slug), authors:authors!inner(id, name, slug, profile_image_url, author_translations!inner(bio, lang_code)), categories:categories!inner(id, slug, icon_name, category_translations!inner(name, seo_slug, lang_code))`;
  const [articlesRes, popularRes] = await Promise.all([
    supabase.from('articles').select(selectQuery).eq('category_id', categoryData.id).eq('article_translations.lang_code', lang).order('publication_date', { ascending: false }),
    supabase.from('articles').select(selectQuery).eq('category_id', categoryData.id).eq('article_translations.lang_code', lang).order('view_count', { ascending: false, nulls: 'last' }).limit(5)
  ]);

  return {
    category: { id: categoryData.id, name: categoryData.category_translations[0].name, description: categoryData.category_translations[0].description, iconName: categoryData.icon_name },
    parentCategory: { name: parentData.category_translations[0].name, seoSlug: parentData.category_translations[0].seo_slug },
    articles: checkError(articlesRes, 'articles').map(raw => transformArticle(raw, lang)).filter(Boolean) as Article[],
    popularArticles: checkError(popularRes, 'popular articles').map(raw => transformArticle(raw, lang)).filter(Boolean) as Article[],
  };
}

// ============================================================================
// 5. PAGE DE DÉTAIL D'ARTICLE (/fr/magazine/[category]/[slug].astro)
// ============================================================================
export interface ArticlePageData {
  article: Article; parentCategory: { name: string; seoSlug: string; }; relatedArticles: Article[];
  comments: Comment[]; totalCommentsCount: number;
}

export async function getArticlePageData(lang: string, categorySlug: string, articleSlug: string): Promise<ArticlePageData> {
  const selectQuery = `id, publication_date, read_time_minutes, view_count, featured_image_url, article_translations!inner(name, description, content, featured_image_alt, seo_slug), authors:authors!inner(id, name, slug, profile_image_url, author_translations!inner(bio, lang_code)), categories:categories!inner(id, slug, icon_name, parent_id, category_translations!inner(name, seo_slug, lang_code))`;
  const { data: articleRaw, error: articleError } = await supabase.from('articles').select(selectQuery).eq('article_translations.seo_slug', articleSlug).eq('article_translations.lang_code', lang).single();
  if (articleError || !articleRaw) throw new AstroError('Page Not Found', `Article "${articleSlug}" non trouvé.`);

  const category = articleRaw.categories;
  const categoryTranslation = category.category_translations.find(t => t.lang_code === lang);
  if (!categoryTranslation || categoryTranslation.seo_slug !== categorySlug || category.parent_id !== MAGAZINE_ROOT_ID) throw new AstroError('Page Not Found', `L'URL de l'article est invalide ou ne correspond pas à la hiérarchie du magazine.`);

  const { data: parentData, error: parentError } = await supabase.from('categories').select('category_translations!inner(name, seo_slug)').eq('id', MAGAZINE_ROOT_ID).eq('category_translations.lang_code', lang).single();
  if (parentError || !parentData) throw new AstroError(`Configuration Error`, `Catégorie racine Magazine introuvable.`);
  
  const [relatedRes, commentsRes] = await Promise.all([
    supabase.from('article_related_articles').select(`related_article:articles!related_article_id(${selectQuery})`).eq('article_id', articleRaw.id).eq('related_article.article_translations.lang_code', lang).order('display_order').limit(3),
    supabase.from('comments').select(`id, author_name, content, created_at, parent_comment_id`).eq('article_id', articleRaw.id).eq('status', 'approved').is('deleted_at', null).order('created_at')
  ]);
  
  const article = transformArticle(articleRaw, lang);
  if (!article) throw new AstroError('Page Not Found', 'Erreur de transformation des données de l\'article.');

  const flatComments = checkError(commentsRes, 'comments');
  const totalCommentsCount = flatComments.length;

  const commentMap = new Map();
  flatComments.forEach(c => { c.children = []; commentMap.set(c.id, c); });
  const nestedComments: Comment[] = [];
  flatComments.forEach(c => { c.parent_comment_id ? commentMap.get(c.parent_comment_id)?.children.push(c) : nestedComments.push(c); });

  return {
    article,
    parentCategory: { name: parentData.category_translations[0].name, seoSlug: parentData.category_translations[0].seo_slug },
    relatedArticles: checkError(relatedRes, 'related articles').map(r => r.related_article ? transformArticle(r.related_article, lang) : null).filter(Boolean) as Article[],
    comments: nestedComments,
    totalCommentsCount,
  };
}