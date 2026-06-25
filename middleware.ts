import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Definimos qué rutas son públicas
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

// 1. Agregamos 'async' aquí
export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        // 2. Usamos 'await auth.protect()' en lugar de 'auth().protect()'
        await auth.protect();
    }
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};