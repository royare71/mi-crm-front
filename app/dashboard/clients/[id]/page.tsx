import { auth } from "@clerk/nextjs/server";
import { fetchWithAuth } from "@/lib/api";
import ClientDetailClient from "./ClientDetailClient";
import { redirect } from "next/navigation";

// 1. Tipamos params correctamente como una Promesa
export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
        redirect("/sign-in");
    }

    // 2. Esperamos la Promesa completa de params PRIMERO
    const resolvedParams = await params;
    const id = resolvedParams.id;

    try {
        console.log(`Esta es la llamada al api /api/clients/${id}`);
        const res = await fetchWithAuth(`/api/clients/${id}`, token, { cache: 'no-store' });

        if (!res.ok) {
            return (
                <div className="alert alert-danger">
                    <span>⚠️</span>
                    <div>
                        <strong>Error</strong>
                        <p>No se pudo cargar el cliente. Es posible que no exista o no tengas permiso para verlo.</p>
                    </div>
                </div>
            );
        }

        const client = await res.json();
        return <ClientDetailClient initialClient={client} />;
    } catch (error) {
        return (
            <div className="alert alert-danger">
                <span>⚠️</span>
                <div>
                    <strong>Error de conexión</strong>
                    <p>No se pudo conectar con el servidor.</p>
                </div>
            </div>
        );
    }
}