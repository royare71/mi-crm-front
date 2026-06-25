// src/lib/api.ts

export async function fetchWithAuth(
    endpoint: string,
    token: string | null,
    options: RequestInit = {}
) {
    if (!token) {
        throw new Error("No se proporcionó un token de autenticación");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    return response;
}