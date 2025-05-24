import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthenticatedRequest extends NextRequest {
  user?: { userId: string; email: string; name: string }; // Add other user properties if needed
}

type ApiHandler = (req: AuthenticatedRequest, params?: any) => Promise<NextResponse>;

export function verifyToken(req: NextRequest): { userId: string; email: string; name: string } | null {
  const token = req.headers.get('Authorization')?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables for token verification.');
    // In a real app, you might throw an error or handle this more robustly
    return null; 
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload & { userId: string; email: string; name: string };
    return { userId: decoded.userId, email: decoded.email, name: decoded.name };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Higher-Order Function to protect API routes (conceptual example)
// This demonstrates how verifyToken could be used in a wrapper.
// Actual usage might involve calling verifyToken directly in each protected API route for now.
export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req: AuthenticatedRequest, params?: any) => {
    const userData = verifyToken(req);

    if (!userData) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Attach user data to the request object if needed by the handler
    req.user = userData; 

    return handler(req, params);
  };
}

/*
Example usage in an API route (e.g., app/api/protected-route/route.ts):

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/authUtils'; // Assuming this path

export async function GET(request: NextRequest) {
  const userData = verifyToken(request);

  if (!userData) {
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }

  // Proceed with API logic, userData contains { userId, email, name }
  return NextResponse.json({ message: `Hello ${userData.name}, you are authenticated!`, data: userData });
}

// Or using the HOF (Higher-Order Function) wrapper:
// import { withAuth } from '@/lib/authUtils';
//
// async function myProtectedHandler(req) {
//   // req.user is available here
//   return NextResponse.json({ message: `Hello ${req.user.name}, you are authenticated!`, data: req.user });
// }
//
// export const GET = withAuth(myProtectedHandler);
*/
