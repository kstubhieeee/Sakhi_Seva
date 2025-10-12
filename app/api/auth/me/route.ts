import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// Try to import MongoDB dependencies, fallback if not available
let connectDB: any = null;
let User: any = null;

try {
  connectDB = require('@/lib/mongodb').default;
  User = require('@/models/User').default;
} catch (error) {
  console.warn('MongoDB not available, using fallback mode');
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if MongoDB is available
    if (!connectDB || !User) {
      // Fallback mode - return mock user data
      return NextResponse.json({
        user: {
          id: payload.userId,
          fullName: payload.fullName,
          email: payload.email,
          age: 25,
          phoneNumber: '+1234567890'
        }
      })
    }

    // MongoDB mode
    await connectDB()

    // Get user from database
    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        phoneNumber: user.phoneNumber
      }
    })

  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
