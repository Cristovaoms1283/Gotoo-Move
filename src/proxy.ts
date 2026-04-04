import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  console.log(`[MIDDLEWARE] Rota: ${req.nextUrl.pathname} | UserID: ${userId || 'Nulo'}`);
  
  if (req.nextUrl.pathname === "/api/temp-seed") return;
  if (isProtectedRoute(req)) await auth.protect();
}, { clockSkewInMs: 1000 * 60 * 5 });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
