import { auth } from "@clerk/nextjs/server";
import { fetchWithAuth } from "@/lib/api";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
        redirect("/sign-in");
    }

    try {
        const res = await fetchWithAuth('/api/users', token, { cache: 'no-store' });
        
        if (!res.ok) {
            return (
                <div className="alert alert-danger" style={{ margin: '20px' }}>
                    <span>⚠️</span>
                    <div>
                        <strong>Acceso Denegado</strong>
                        <p>No tienes los permisos de administrador necesarios para ver esta sección.</p>
                    </div>
                </div>
            );
        }

        const users = await res.json();
        return <SettingsClient initialUsers={users} />;
    } catch (error) {
        return (
            <div className="alert alert-danger" style={{ margin: '20px' }}>
                <span>⚠️</span>
                <div>
                    <strong>Error de conexión</strong>
                    <p>No se pudo conectar con el servidor.</p>
                </div>
            </div>
        );
    }
}
