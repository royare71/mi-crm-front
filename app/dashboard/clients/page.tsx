import { auth } from "@clerk/nextjs/server";
import { fetchWithAuth } from "@/lib/api";
import NewClientButton from "@/components/NewClientButton";
import Link from "next/link";

interface Client {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    empresa?: string;
    estado?: string;
    creado_en: string;
}

export default async function ClientesDirectoryPage() {
    const { getToken } = await auth();
    const token = await getToken();

    let clients: Client[] = [];
    let errorLoading = false;

    try {
        const res = await fetchWithAuth('/api/clients', token, { cache: 'no-store' });

        if (res.ok) {
            clients = await res.json();
        } else {
            errorLoading = true;
        }
    } catch {
        errorLoading = true;
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Directorio de Clientes</h1>
                    <p className="page-subtitle">Gestiona toda tu base de contactos ({clients.length} en total).</p>
                </div>
                <NewClientButton className="btn btn-primary">
                    <span>+</span>
                    Nuevo Cliente
                </NewClientButton>
            </div>

            {errorLoading ? (
                <div className="alert alert-danger">
                    <span>⚠️</span>
                    <div>
                        <strong>Error de conexión</strong>
                        <p style={{ margin: '4px 0 0', opacity: 0.85 }}>
                            No se pudo cargar el directorio de clientes.
                        </p>
                    </div>
                </div>
            ) : clients.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No hay clientes registrados</div>
                    <p className="empty-state-description">
                        Tu directorio está vacío.
                    </p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table className="table-crm">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Empresa</th>
                                    <th>Correo Electrónico</th>
                                    <th>Teléfono</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Aquí NO usamos slice, mostramos todos */}
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '50%',
                                                        background: 'var(--crm-accent-light)',
                                                        color: 'var(--crm-accent)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {client.nombre ? client.nombre.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{client.nombre}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--crm-text-secondary)' }}>{client.empresa || '—'}</td>
                                        <td style={{ color: 'var(--crm-text-secondary)' }}>{client.email}</td>
                                        <td style={{ color: 'var(--crm-text-secondary)' }}>{client.telefono || '—'}</td>
                                        <td>
                                            <span className={`badge ${client.estado === 'ACTIVO' ? 'badge-success' : 'badge-neutral'}`}>
                                                {client.estado}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link href={`/dashboard/clients/${client.id}`} className="btn btn-ghost btn-sm">Ver Detalle</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}