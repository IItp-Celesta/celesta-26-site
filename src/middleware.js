import { NextResponse } from 'next/server';

export function middleware(req) {
  // Check if the user is trying to access the admin area
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new NextResponse('Access Denied', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      });
    }

    // Decode the basic auth header
    const authValue = authHeader.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    const secretKey = process.env.ADMIN_PASSWORD 

    if (pwd === secretKey) {
      return NextResponse.next(); 
    }

    // Wrong password, trigger the prompt again
    return new NextResponse('Invalid Secret Key', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};