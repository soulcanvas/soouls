import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/api/webhook(.*)']);
const isApiRoute = createRouteMatcher(['/command-api(.*)', '/api/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    if (isApiRoute(req)) {
      // Don't use auth.protect() for API routes, it redirects to HTML
      const { userId } = await auth();
      if (!userId) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Standard page protection - unified sign in/up page
      await auth.protect({ unauthenticatedUrl: new URL('/sign-in', req.url).toString() });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc|command-api)(.*)',
  ],
};
