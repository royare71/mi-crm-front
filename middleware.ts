import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define las rutas públicas
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
    // 1. Ignoramos rutas de API para que el backend de Express valide el token
    if (request.nextUrl.pathname.startsWith('/api')) {
        return;
    }

    // 2. Resolvemos la autenticación
    const authObject = await auth();

    // 3. Si no es pública y no tiene userId, redirigimos manualmente
    if (!isPublicRoute(request) && !authObject.userId) {
        const signInUrl = new URL('/sign-in', request.url);
        return NextResponse.redirect(signInUrl);
    }
});

export const config = {
    matcher: [
        '/((?!.*\\..*|_next).*)',
        '/',
        '/(api|trpc)(.*)',
    ],
};