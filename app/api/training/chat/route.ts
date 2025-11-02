import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai/node";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = chatSchema.parse(body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key not configured. Please set GEMINI_API_KEY in your .env.local file.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const groundingTool = {
      googleSearch: {},
    };

    const config = {
      tools: [groundingTool],
    };

    const enhancedPrompt = `${message}

CRITICAL INSTRUCTIONS:
1. You MUST search the web using Google Search to find REAL, EXISTING, and CURRENTLY AVAILABLE resources
2. ONLY include YouTube videos, articles, and blogs that you have VERIFIED exist through your web search
3. DO NOT make up or guess any URLs - all links must come from your actual search results
4. Verify that YouTube videos are not deleted, private, or unavailable
5. Verify that article/blog URLs are not 404 errors or dead links

Format your response in the following JSON structure. Only return valid JSON:

{
  "header": "Main heading for the response",
  "intro": "Brief introductory text (2-3 sentences)",
  "youtubeVideos": [
    {
      "title": "YouTube video title (from search results)",
      "link": "Full YouTube URL (verified from search)",
      "summary": "What viewers will learn from this video (3-4 sentences)"
    }
  ],
  "resources": [
    {
      "type": "article|blog",
      "title": "Resource title (from search results)",
      "link": "Full URL (verified from search)",
      "summary": "Detailed summary explaining what users will learn (3-4 sentences)"
    }
  ]
}

REQUIREMENTS: 
- Include 3-5 YouTube video links in the youtubeVideos array
- Include 3-5 articles/blogs in the resources array
- ALL URLs must be from your Google Search grounding results
- NO made-up or guessed URLs
- Each resource must be verified to exist and be accessible`;

    const contents =
      history.length > 0
        ? [...history.map((msg) => msg.content), enhancedPrompt]
        : enhancedPrompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config,
    });

    const responseText =
      response.text || "I apologize, but I could not generate a response.";

    const groundingMetadata =
      (response as any).candidates?.[0]?.groundingMetadata || null;

    let structuredData = null;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log("Could not parse JSON response, using plain text");
    }

    return NextResponse.json({
      message: responseText,
      structuredData,
      groundingMetadata,
      citations: groundingMetadata ? extractCitations(groundingMetadata) : [],
    });
  } catch (error: any) {
    console.error("Chat error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

function extractCitations(metadata: any) {
  const citations: Array<{ title: string; url: string; index: number }> = [];

  if (metadata.groundingChunks) {
    metadata.groundingChunks.forEach((chunk: any, index: number) => {
      if (chunk.web) {
        citations.push({
          title: chunk.web.title || "Untitled",
          url: chunk.web.uri || "",
          index: index + 1,
        });
      }
    });
  }

  return citations;
}
