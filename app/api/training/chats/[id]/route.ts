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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    if (!connectDB || !Chat) {
      return NextResponse.json(
        { error: 'Chat storage not available' },
        { status: 503 }
      );
    }

    await connectDB();
    
    const chat = await Chat.findOne({ _id: id, userId }).lean();

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    if (!connectDB || !Chat) {
      return NextResponse.json(
        { error: 'Chat storage not available' },
        { status: 503 }
      );
    }

    await connectDB();
    
    const chat = await Chat.findOneAndDelete({ _id: id, userId });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

