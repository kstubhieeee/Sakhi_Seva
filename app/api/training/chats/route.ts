import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

let connectDB: any = null;
let Chat: any = null;

try {
  connectDB = require('@/lib/mongodb').default;
  Chat = require('@/models/Chat').default;
} catch (error) {
  console.warn('MongoDB not available, using fallback mode');
}

export async function GET(request: NextRequest) {
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

    if (!connectDB || !Chat) {
      return NextResponse.json({ chats: [] });
    }

    await connectDB();
    
    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt')
      .lean();

    return NextResponse.json({ 
      chats: chats.map((chat: any) => ({
        id: chat._id.toString(),
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }))
    });

  } catch (error: any) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

