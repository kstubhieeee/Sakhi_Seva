import { getLinkPreview } from 'link-preview-js';
import { getCached, setCached } from '@/lib/utils/cache';

export interface ArticleResult {
  title: string;
  link: string;
  summary: string;
  image?: string;
}

function isErrorPage(title: string, summary: string): boolean {
  const errorPatterns = [
    /^Error \d{3}/i,
    /not found/i,
    /unsupported media type/i,
    /server error/i,
    /forbidden/i,
    /unauthorized/i,
    /bad gateway/i,
    /service unavailable/i,
    /gateway timeout/i,
  ];

  return errorPatterns.some(pattern => pattern.test(title) || pattern.test(summary));
}

export async function fetchArticleMeta(url: string): Promise<ArticleResult | null> {
  const cacheKey = `article:${url}`;
  const cached = getCached<ArticleResult>(cacheKey);
  if (cached) return cached;

  try {
    const preview = await getLinkPreview(url, {
      followRedirects: 'follow',
      timeout: 4000,
    });

    if (preview && typeof preview === 'object') {
      const title = preview.title || 'Untitled';
      const summary = preview.description || 'Learn more about this article';
      
      if (isErrorPage(title, summary)) {
        console.log(`Skipping error page: ${title}`);
        return null;
      }

      const result = {
        title,
        link: url,
        summary,
        image: preview.images && preview.images.length > 0 ? preview.images[0] : undefined,
      };
      
      setCached(cacheKey, result);
      return result;
    }

    return null;
  } catch (error: any) {
    console.log(`Failed to fetch metadata for ${url}:`, error.message);
    return null;
  }
}

function isErrorPageExported(title: string, summary: string): boolean {
  const errorPatterns = [
    /^Error \d{3}/i,
    /not found/i,
    /unsupported media type/i,
    /server error/i,
    /forbidden/i,
    /unauthorized/i,
    /bad gateway/i,
    /service unavailable/i,
    /gateway timeout/i,
  ];

  return errorPatterns.some(pattern => pattern.test(title) || pattern.test(summary));
}

export async function validateAndFetchArticles(urls: string[]): Promise<ArticleResult[]> {
  const results: ArticleResult[] = [];
  
  const fetchPromises = urls.slice(0, 10).map(url => 
    fetchArticleMeta(url).catch(() => null)
  );
  
  const fetchedResults = await Promise.all(fetchPromises);
  
  for (const meta of fetchedResults) {
    if (meta) {
      results.push(meta);
      if (results.length >= 5) break;
    }
  }

  return results;
}

export function filterErrorPages(articles: any[]): any[] {
  return articles.filter(article => {
    if (!article.title || !article.summary) return false;
    return !isErrorPageExported(article.title, article.summary);
  });
}

