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

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(13, 'Age must be at least 13').max(120, 'Age must be less than 120'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    
    // Check if MongoDB is available
    if (!connectDB || !User) {
      // Fallback mode - simulate successful signup
      const mockUser = {
        _id: `user_${Date.now()}`,
        fullName: validatedData.fullName,
        email: validatedData.email,
        age: validatedData.age,
        phoneNumber: validatedData.phoneNumber
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
          message: 'User created successfully (Demo Mode)',
          user: {
            id: mockUser._id,
            fullName: mockUser.fullName,
            email: mockUser.email,
            age: mockUser.age,
            phoneNumber: mockUser.phoneNumber
          }
        },
        { status: 201 }
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
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = new User(validatedData)
    await user.save()

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName
    })

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          age: user.age,
          phoneNumber: user.phoneNumber
        }
      },
      { status: 201 }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Signup error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
