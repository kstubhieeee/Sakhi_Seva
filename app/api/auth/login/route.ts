import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/jwt'
import { z } from 'zod'

// Try to import MongoDB dependencies, fallback if not available
let connectDB: any = null;
let User: any = null;

try {
  connectDB = require('@/lib/mongodb').default;
  User = require('@/models/User').default;
} catch (error) {
  console.warn('MongoDB not available, using fallback mode');
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Check if MongoDB is available
    if (!connectDB || !User) {
      // Fallback mode - simulate successful login for demo
      const mockUser = {
        _id: `user_${Date.now()}`,
        fullName: 'Demo User',
        email: validatedData.email,
        age: 25,
        phoneNumber: '+1234567890'
      }

      // Generate JWT token
      const token = generateToken({
        userId: mockUser._id,
        email: mockUser.email,
        fullName: mockUser.fullName
      })

      // Set HTTP-only cookie
      const response = NextResponse.json(
        { 
          message: 'Login successful (Demo Mode)',
          user: {
            id: mockUser._id,
            fullName: mockUser.fullName,
            email: mockUser.email,
            age: mockUser.age,
            phoneNumber: mockUser.phoneNumber
          }
        },
        { status: 200 }
      )

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      return response
    }

    // MongoDB mode
    await connectDB()
    
    // Find user by email
    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName
    })

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          age: user.age,
          phoneNumber: user.phoneNumber
        }
      },
      { status: 200 }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
