import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai/node'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [] } = chatSchema.parse(body)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env.local file.' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })
    
    const groundingTool = {
      googleSearch: {},
    }

    const config = {
      tools: [groundingTool],
    }

    const contents = history.length > 0 
      ? [...history.map(msg => msg.content), message]
      : message

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config,
    })

    const responseText = response.text || 'I apologize, but I could not generate a response.'
    
    const groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata || null
    
    return NextResponse.json({
      message: responseText,
      groundingMetadata,
      citations: groundingMetadata ? extractCitations(groundingMetadata) : []
    })

  } catch (error: any) {
    console.error('Chat error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

function extractCitations(metadata: any) {
  const citations: Array<{ title: string; url: string; index: number }> = []
  
  if (metadata.groundingChunks) {
    metadata.groundingChunks.forEach((chunk: any, index: number) => {
      if (chunk.web) {
        citations.push({
          title: chunk.web.title || 'Untitled',
          url: chunk.web.uri || '',
          index: index + 1
        })
      }
    })
  }
  
  return citations
}

