import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for auth token in session storage (client-side auth check)
  // For server-side protection, we use cookies
  const authCookie = request.cookies.get('optify_auth')

  // If no auth cookie and trying to access main page, redirect to login
  if (!authCookie && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If has auth cookie and trying to access login page, redirect to main
  if (authCookie && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login'],
}