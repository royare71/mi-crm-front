import { auth } from "@clerk/nextjs/server";
import { fetchWithAuth } from "@/lib/api";

interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export default async function DashboardPage() {
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
            {/* Encabezado de página */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Panel de Control</h1>
                    <p className="page-subtitle">Resumen general de tu sistema CRM.</p>
                </div>
                <button className="btn btn-primary">
                    <span>+</span>
                    Nuevo Cliente
                </button>
            </div>

            {/* Tarjetas de estadísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Clientes</div>
                    <div className="stat-value">{clients.length}</div>
                    <div className="stat-change" style={{ color: 'var(--crm-success)' }}>
                        Registrados
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Activos</div>
                    <div className="stat-value">{clients.length}</div>
                    <div className="stat-change" style={{ color: 'var(--crm-text-muted)' }}>
                        En seguimiento
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Notas</div>
                    <div className="stat-value">—</div>
                    <div className="stat-change" style={{ color: 'var(--crm-text-muted)' }}>
                        Sin datos aún
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Este Mes</div>
                    <div className="stat-value">—</div>
                    <div className="stat-change" style={{ color: 'var(--crm-text-muted)' }}>
                        Nuevos clientes
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            {errorLoading ? (
                <div className="alert alert-danger">
                    <span>⚠️</span>
                    <div>
                        <strong>Error de conexión</strong>
                        <p style={{ margin: '4px 0 0', opacity: 0.85 }}>
                            No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.
                        </p>
                    </div>
                </div>
            ) : clients.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No hay clientes registrados</div>
                    <p className="empty-state-description">
                        Comienza agregando tu primer cliente para gestionar sus datos e interacciones.
                    </p>
                    <button className="btn btn-primary">
                        <span>+</span>
                        Agregar Primer Cliente
                    </button>
                </div>
            ) : (
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--crm-text)' }}>
                            Clientes Recientes
                        </h3>
                        <span className="badge badge-success">{clients.length} registros</span>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table className="table-crm">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Correo Electrónico</th>
                                    <th>Teléfono</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
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
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{client.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--crm-text-secondary)' }}>{client.email}</td>
                                        <td style={{ color: 'var(--crm-text-secondary)' }}>{client.phone || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn btn-ghost btn-sm">Ver</button>
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