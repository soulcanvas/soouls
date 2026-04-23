import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { publicInfoPaths } from './src/config/publicInfoRoutes';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/forgot-password(.*)',
  '/onboarding(.*)',
  '/api/trpc/(.*)',
  ...publicInfoPaths,
]);
const isDashboardRoute = createRouteMatcher([
  '/home(.*)',
  '/home/dashboard(.*)',
  '/home/canvas(.*)',
  '/home/new-entry(.*)',
  '/home/clusters(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Redirect /dashboard to /home for backward compatibility (dashboard is now at /home)
  if (userId && req.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // Redirect /home/clusters to /home/canvas (clusters renamed to canvas)
  // if (userId && req.nextUrl.pathname === '/home/clusters') {
  //   return NextResponse.redirect(new URL('/home/canvas', req.url));
  // }

  // Redirect /home/dashboard to /home for backward compatibility (dashboard is now at /home)
  if (userId && req.nextUrl.pathname === '/home/dashboard') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // If user is logged in and tries to access the landing page, redirect to home (dashboard)
  if (userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // If user is not logged in and tries to access dashboard, redirect to sign-in
  if (!userId && isDashboardRoute(req)) {
    return redirectToSignIn();
  }

  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
