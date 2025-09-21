import { prisma } from '@lib/prisma';
import { AstroError } from 'astro/errors';

// ============================================================================
// 0. CONSTANTE CENTRALE
// ============================================================================
const MAGAZINE_ROOT_ID = 'd20b7566-105a-47f3-947f-dab773bef43e';

// ============================================================================
// 1. TYPES DE DONNÉES PARTAGÉS
// ============================================================================
export interface Article {
  id: string;
  title: string;
  summary: string;
  content?: string;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  seoSlug: string;
  publicationDate: string;
  readTimeMinutes: number;
  viewCount: number;
  author: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    profileImageUrl: string | null;
  };
  category: {
    id: string;
    name: string;
    seoSlug: string;
    iconName: string | null;
  };
}

export interface SidebarCategory {
  id: string;
  name: string;
  seoSlug: string;
  articlesCount: number;
}

export interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  children: Comment[];
}

// ============================================================================
// 2. FONCTION DE TRANSFORMATION UNIVERSELLE
// ============================================================================
function transformArticle(raw: any, lang: string): Article | null {
  try {
    const translation = raw.translations?.find((t: any) => t.langCode === lang);
    if (!translation) return null;

    const categoryTranslation = raw.category?.translations?.find((t: any) => t.langCode === lang);

    return {
      id: raw.id,
      title: translation.name,
      summary: translation.description || '',
      content: translation.content,
      featuredImageUrl: raw.featuredImageUrl,
      featuredImageAlt: translation.featuredImageAlt,
      seoSlug: translation.seoSlug,
      publicationDate: raw.publishedAt?.toISOString() || raw.createdAt.toISOString(),
      readTimeMinutes: raw.readTimeMinutes || 5,
      viewCount: raw.viewCount || 0,
      author: {
        id: raw.author.id,
        name: raw.author.name || 'Auteur inconnu',
        slug: raw.author.email?.split('@')[0] || 'author',
        bio: raw.author.profile?.bio,
        profileImageUrl: raw.author.image,
      },
      category: {
        id: raw.category.id,
        name: categoryTranslation?.name || raw.category.slug,
        seoSlug: categoryTranslation?.seoSlug || raw.category.slug,
        iconName: raw.category.iconName,
      },
    };
  } catch (error) {
    console.error('Error transforming article:', error);
    return null;
  }
}

// ============================================================================
// 3. PAGE D'INDEX DU MAGAZINE (/fr/magazine/index.astro)
// ============================================================================
export interface MagazinePageData {
  pageTitle: string;
  pageDescription: string | null;
  pageIcon: string | null;
  parentCategorySlug: string;
  featuredArticles: Article[];
  recentArticles: Article[];
  sidebarCategories: SidebarCategory[];
  sidebarPopularArticles: Article[];
}

export async function getMagazineIndexPageData(lang: string, magazineSlug: string): Promise<MagazinePageData> {
  // Get magazine category
  const magazineCategory = await prisma.category.findFirst({
    where: {
      translations: {
        some: {
          langCode: lang,
          seoSlug: magazineSlug
        }
      },
      parentId: null
    },
    include: {
      translations: {
        where: { langCode: lang }
      }
    }
  });

  if (!magazineCategory || !magazineCategory.translations[0]) {
    throw new AstroError(`Page Not Found`, `La catégorie racine du magazine avec le slug "${magazineSlug}" est introuvable pour la langue "${lang}".`);
  }

  const magazineTranslation = magazineCategory.translations[0];
  const magazineCategoryId = magazineCategory.id;

  // Get all data in parallel
  const [categoriesData, featuredArticles, recentArticles, popularArticles] = await Promise.all([
    // Categories with article count
    prisma.category.findMany({
      where: {
        parentId: magazineCategoryId,
        isActive: true
      },
      include: {
        translations: {
          where: { langCode: lang }
        },
        _count: {
          select: {
            articles: {
              where: {
                status: 'published',
                deletedAt: null
              }
            }
          }
        }
      },
      orderBy: { displayOrder: 'asc' }
    }),

    // Featured articles (recent ones for now)
    prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        category: {
          parentId: magazineCategoryId
        }
      },
      include: {
        translations: {
          where: { langCode: lang }
        },
        author: {
          include: {
            profile: true
          }
        },
        category: {
          include: {
            translations: {
              where: { langCode: lang }
            }
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 4
    }),

    // Recent articles
    prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        category: {
          parentId: magazineCategoryId
        }
      },
      include: {
        translations: {
          where: { langCode: lang }
        },
        author: {
          include: {
            profile: true
          }
        },
        category: {
          include: {
            translations: {
              where: { langCode: lang }
            }
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 6
    }),

    // Popular articles
    prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        category: {
          parentId: magazineCategoryId
        }
      },
      include: {
        translations: {
          where: { langCode: lang }
        },
        author: {
          include: {
            profile: true
          }
        },
        category: {
          include: {
            translations: {
              where: { langCode: lang }
            }
          }
        }
      },
      orderBy: { viewCount: 'desc' },
      take: 5
    })
  ]);

  return {
    pageTitle: magazineTranslation.name,
    pageDescription: magazineTranslation.description,
    pageIcon: magazineCategory.iconName,
    parentCategorySlug: magazineTranslation.seoSlug,
    sidebarCategories: categoriesData
      .filter(cat => cat.translations[0])
      .map(cat => ({
        id: cat.id,
        name: cat.translations[0].name,
        seoSlug: cat.translations[0].seoSlug,
        articlesCount: cat._count.articles
      })),
    featuredArticles: featuredArticles.map(article => transformArticle(article, lang)).filter(Boolean) as Article[],
    recentArticles: recentArticles.map(article => transformArticle(article, lang)).filter(Boolean) as Article[],
    sidebarPopularArticles: popularArticles.map(article => transformArticle(article, lang)).filter(Boolean) as Article[]
  };
}

// ============================================================================
// 4. PAGE DE CATÉGORIE (/fr/magazine/[category].astro)
// ============================================================================
export interface CategoryPageData {
  category: { id: string; name: string; description: string | null; iconName: string | null; };
  parentCategory: { name: string; seoSlug: string; };
  articles: Article[];
  popularArticles: Article[];
}

export async function getCategoryPageData(lang: string, categorySlug: string): Promise<CategoryPageData> {
  // Get parent category (magazine root)
  const parentData = await prisma.category.findFirst({
    where: {
      id: MAGAZINE_ROOT_ID
    },
    include: {
      translations: {
        where: { langCode: lang }
      }
    }
  });

  if (!parentData || !parentData.translations[0]) {
    throw new AstroError(`Configuration Error`, `Catégorie racine Magazine introuvable pour la langue "${lang}".`);
  }

  // Get category data
  const categoryData = await prisma.category.findFirst({
    where: {
      translations: {
        some: {
          langCode: lang,
          seoSlug: categorySlug
        }
      },
      parentId: MAGAZINE_ROOT_ID
    },
    include: {
      translations: {
        where: { langCode: lang }
      }
    }
  });

  if (!categoryData || !categoryData.translations[0]) {
    throw new AstroError(`Page Not Found`, `La catégorie "${categorySlug}" n'est pas une sous-catégorie valide du magazine.`);
  }

  // Get articles and popular articles
  const [articles, popularArticles] = await Promise.all([
    prisma.article.findMany({
      where: {
        categoryId: categoryData.id,
        status: 'published',
        deletedAt: null
      },
      include: {
        translations: {
          where: { langCode: lang }
        },
        author: {
          include: {
            profile: true
          }
        },
        category: {
          include: {
            translations: {
              where: { langCode: lang }
            }
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    }),

    prisma.article.findMany({
      where: {
        categoryId: categoryData.id,
        status: 'published',
        deletedAt: null
      },
      include: {
        translations: {
          where: { langCode: lang }
        },
        author: {
          include: {
            profile: true
          }
        },
        category: {
          include: {
            translations: {
              where: { langCode: lang }
            }
          }
        }
      },
      orderBy: { viewCount: 'desc' },
      take: 5
    })
  ]);

  return {
    category: {
      id: categoryData.id,
      name: categoryData.translations[0].name,
      description: categoryData.translations[0].description,
      iconName: categoryData.iconName
    },
    parentCategory: {
      name: parentData.translations[0].name,
      seoSlug: parentData.translations[0].seoSlug
    },
    articles: articles.map(article => transformArticle(article, lang)).filter(Boolean) as Article[],
    popularArticles: popularArticles.map(article => transformArticle(article, lang)).filter(Boolean) as Article[]
  };
}

// ============================================================================
// 5. PAGE DE DÉTAIL D'ARTICLE (/fr/magazine/[category]/[slug].astro)
// ============================================================================
export interface ArticlePageData {
  article: Article;
  parentCategory: { name: string; seoSlug: string; };
  relatedArticles: Article[];
  comments: Comment[];
  totalCommentsCount: number;
}

export async function getArticlePageData(lang: string, categorySlug: string, articleSlug: string): Promise<ArticlePageData> {
  // Get article data
  const articleRaw = await prisma.article.findFirst({
    where: {
      translations: {
        some: {
          langCode: lang,
          seoSlug: articleSlug
        }
      },
      status: 'published',
      deletedAt: null
    },
    include: {
      translations: {
        where: { langCode: lang }
      },
      author: {
        include: {
          profile: true
        }
      },
      category: {
        include: {
          translations: {
            where: { langCode: lang }
          }
        }
      }
    }
  });

  if (!articleRaw || !articleRaw.translations[0]) {
    throw new AstroError('Page Not Found', `Article "${articleSlug}" non trouvé.`);
  }

  // Verify category matches
  const categoryTranslation = articleRaw.category.translations[0];
  if (!categoryTranslation || categoryTranslation.seoSlug !== categorySlug || articleRaw.category.parentId !== MAGAZINE_ROOT_ID) {
    throw new AstroError('Page Not Found', `L'URL de l'article est invalide ou ne correspond pas à la hiérarchie du magazine.`);
  }

  // Get parent category
  const parentData = await prisma.category.findFirst({
    where: {
      id: MAGAZINE_ROOT_ID
    },
    include: {
      translations: {
        where: { langCode: lang }
      }
    }
  });

  if (!parentData || !parentData.translations[0]) {
    throw new AstroError(`Configuration Error`, `Catégorie racine Magazine introuvable.`);
  }

  // Get related articles and comments
  const [relatedArticles, comments] = await Promise.all([
    prisma.articleRelation.findMany({
      where: {
        articleId: articleRaw.id
      },
      include: {
        relatedArticle: {
          include: {
            translations: {
              where: { langCode: lang }
            },
            author: {
              include: {
                profile: true
              }
            },
            category: {
              include: {
                translations: {
                  where: { langCode: lang }
                }
              }
            }
          }
        }
      },
      take: 3
    }),

    prisma.comment.findMany({
      where: {
        articleId: articleRaw.id,
        status: 'approved',
        deletedAt: null
      },
      include: {
        author: true
      },
      orderBy: { createdAt: 'asc' }
    })
  ]);

  // Increment view count
  await prisma.article.update({
    where: { id: articleRaw.id },
    data: { viewCount: { increment: 1 } }
  });

  const article = transformArticle(articleRaw, lang);
  if (!article) {
    throw new AstroError('Page Not Found', 'Erreur de transformation des données de l\'article.');
  }

  // Transform comments into nested structure
  const totalCommentsCount = comments.length;
  const commentMap = new Map();
  const transformedComments = comments.map(c => ({
    id: c.id,
    author_name: c.author?.name || c.authorName || 'Anonyme',
    content: c.content,
    created_at: c.createdAt.toISOString(),
    children: [] as Comment[]
  }));

  transformedComments.forEach(c => {
    c.children = [];
    commentMap.set(c.id, c);
  });

  const nestedComments: Comment[] = [];
  comments.forEach(c => {
    const transformedComment = commentMap.get(c.id);
    if (c.parentCommentId && commentMap.has(c.parentCommentId)) {
      commentMap.get(c.parentCommentId).children.push(transformedComment);
    } else {
      nestedComments.push(transformedComment);
    }
  });

  return {
    article,
    parentCategory: {
      name: parentData.translations[0].name,
      seoSlug: parentData.translations[0].seoSlug
    },
    relatedArticles: relatedArticles
      .map(r => transformArticle(r.relatedArticle, lang))
      .filter(Boolean) as Article[],
    comments: nestedComments,
    totalCommentsCount
  };
}