import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai/node";
import { searchYouTube } from "@/lib/scrapers/youtube";
import { retryWithBackoff } from "@/lib/utils/retry";
import {
  validateAndFetchArticles,
  filterErrorPages,
} from "@/lib/scrapers/article-fetcher";
import { verifyToken } from "@/lib/jwt";
import { z } from "zod";

const resourcesSchema = z.object({
  message: z.string().min(1),
  type: z.enum(["youtube", "articles"]),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, type } = resourcesSchema.parse(body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    if (type === "youtube") {
      const queryPrompt = `Generate 2-3 YouTube search queries for: "${message}"

Return ONLY a JSON array of search queries: ["query 1", "query 2", "query 3"]
Return ONLY valid JSON, no other text.`;

      const response = await retryWithBackoff(() =>
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: queryPrompt,
        })
      );

      let queries: string[] = [];
      try {
        const jsonMatch = (response.text || "").match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          queries = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.log("Could not parse YouTube queries");
      }

      const videos = await Promise.all(
        queries.slice(0, 2).map((q: string) => searchYouTube(q))
      ).then((results) => results.flat());

      return NextResponse.json({
        youtubeVideos: videos.slice(0, 5).map((video) => ({
          title: video.title,
          link: video.link,
          summary: video.summary,
        })),
      });
    } else {
      const groundingTool = { googleSearch: {} };
      const config = { tools: [groundingTool] };

      const articlePrompt = `Find 5-7 high-quality articles or blogs about: "${message}"

Using your Google Search grounding, return ONLY a JSON array in this format:

[
  {
    "title": "Article title",
    "link": "Full URL",
    "summary": "Brief 2-3 sentence summary"
  }
]

Return ONLY valid JSON, no additional text.`;

      const articleResponse = await retryWithBackoff(() =>
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: articlePrompt,
          config,
        })
      );

      const articleResponseText = articleResponse.text || "";
      let articles: any[] = [];
      
      try {
        const jsonMatch = articleResponseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          articles = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log("Could not parse articles JSON");
      }

      const groundingMetadata =
        (articleResponse as any).candidates?.[0]?.groundingMetadata || null;

      let citations: Array<{ title: string; url: string; index: number }> = [];

      if (groundingMetadata?.groundingChunks) {
        groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
          if (chunk.web) {
            citations.push({
              title: chunk.web.title || "Untitled",
              url: chunk.web.uri || "",
              index: index + 1,
            });
          }
        });
      }

      let allUrls: string[] = [];

      if (articles.length > 0) {
        allUrls = articles.map((a: any) => a.link);
      } else if (citations.length > 0) {
        allUrls = citations.map((c) => c.url);
      }

      let validatedArticles = await validateAndFetchArticles(allUrls);

      if (validatedArticles.length === 0 && articles.length > 0) {
        const filteredArticles = filterErrorPages(articles);
        validatedArticles = filteredArticles.slice(0, 5).map((article: any) => ({
          title: article.title,
          link: article.link,
          summary: article.summary,
        }));
      } else if (validatedArticles.length === 0 && citations.length > 0) {
        validatedArticles = citations.slice(0, 5).map((cite) => ({
          title: cite.title,
          link: cite.url,
          summary: `Learn more about ${cite.title}`,
        }));
      }

      return NextResponse.json({
        resources: validatedArticles.slice(0, 5).map((article) => ({
          type: "article" as const,
          title: article.title,
          link: article.link,
          summary: article.summary,
          image: article.image,
        })),
      });
    }
  } catch (error: any) {
    console.error("Resources error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

