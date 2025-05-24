import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    // Explicitly select the password field as it's not returned by default
    const user = await User.findOne({ email }).select('+password'); 

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' }, // Generic message for security
        { status: 401 }
      );
    }

    // Compare password
    // user.password will exist here due to .select('+password')
    const isPasswordMatch = await bcrypt.compare(password, user.password!); 

    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' }, // Generic message
        { status: 401 }
      );
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name }, // Payload
      jwtSecret,
      { expiresIn: '1d' } // Token expiration (e.g., 1 day)
    );
    
    // Omit password from user object sent in response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      { token, user: userResponse, message: 'Login successful' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
