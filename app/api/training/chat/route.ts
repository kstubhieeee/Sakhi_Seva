import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai/node";
import { z } from "zod";
import { searchYouTube } from "@/lib/scrapers/youtube";
import { retryWithBackoff } from "@/lib/utils/retry";
import {
  validateAndFetchArticles,
  filterErrorPages,
} from "@/lib/scrapers/article-fetcher";
import { verifyToken } from "@/lib/jwt";
import { needsResources } from "@/lib/utils/needs-resources";

let connectDB: any = null;
let Chat: any = null;

try {
  connectDB = require('@/lib/mongodb').default;
  Chat = require('@/models/Chat').default;
} catch (error) {
  console.warn('MongoDB not available, using fallback mode');
}

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  chatId: z.string().optional(),
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

    const userId = payload.userId;

    const body = await request.json();
    const { message, chatId, history = [] } = chatSchema.parse(body);

    let existingChat = null;
    let fullHistory = history;

    if (chatId && connectDB && Chat) {
      try {
        await connectDB();
        existingChat = await Chat.findOne({ _id: chatId, userId });
        
        if (existingChat) {
          fullHistory = existingChat.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }));
        }
      } catch (error) {
        console.log('Error loading chat:', error);
      }
    }

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

    const contextHistory = fullHistory.length > 0 
      ? `Previous conversation:\n${fullHistory.slice(-10).map((h: any) => `${h.role}: ${h.content}`).join('\n')}\n\n`
      : '';

    const shouldFetchResources = await needsResources(message, fullHistory, ai);

    let responseText = "";
    let structuredData = null;
    let youtubeVideos: any[] = [];
    let validatedArticles: any[] = [];

    if (shouldFetchResources) {
      const summaryPrompt = `Provide a brief, informative 3-4 sentence summary about: ${message}

Return ONLY the summary text, no additional formatting or explanation.`;

      let aiSummary = "Here are the best resources I found to help you learn about this topic.";

      try {
        const summaryResponse = await retryWithBackoff(() =>
          ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: summaryPrompt,
          })
        );
        aiSummary = summaryResponse.text || aiSummary;
      } catch (error) {
        console.log("Could not generate summary, using default");
      }

      responseText = aiSummary;
      structuredData = {
        header: "Recommended Resources",
        intro: aiSummary,
        youtubeVideos: [],
        resources: [],
      };
    } else {
      const simplePrompt = `${contextHistory}User: ${message}\n\nProvide a helpful, concise response.`;
      
      const response = await retryWithBackoff(() =>
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: simplePrompt,
        })
      );
      
      responseText = response.text || "";
    }

    const userMessage = {
      role: 'user' as const,
      content: message
    };

    const aiMessage = {
      role: 'model' as const,
      content: responseText,
      citations: [],
      structuredData
    };

    let savedChatId = chatId;

    if (connectDB && Chat) {
      try {
        await connectDB();
        
        if (existingChat) {
          existingChat.messages.push(userMessage, aiMessage);
          await existingChat.save();
          savedChatId = existingChat._id.toString();
        } else {
          const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
          const newChat = new Chat({
            userId,
            title,
            messages: [userMessage, aiMessage]
          });
          await newChat.save();
          savedChatId = newChat._id.toString();
        }
      } catch (error) {
        console.error('Error saving chat:', error);
      }
    }

    return NextResponse.json({
      message: responseText,
      structuredData,
      citations: [],
      chatId: savedChatId,
      needsResources: shouldFetchResources
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
