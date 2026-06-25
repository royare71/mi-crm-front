import { auth } from "@clerk/nextjs/server";
import { fetchWithAuth } from "@/lib/api";
import NewClientButton from "@/components/NewClientButton";
import Link from "next/link";

// 1. Actualizamos la interfaz para que TypeScript sepa que vienen fechas y notas
interface Client {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    empresa?: string;
    estado?: string;
    creado_en: string; // <-- Fecha de creación
    _count: { notes: number };
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

    // =========================================================
    // 🧠 LÓGICA DE NEGOCIO (MÉTRICAS DEL DASHBOARD)
    // =========================================================

    // A) Clientes activos
    const activos = clients.filter(c => c.estado === 'ACTIVO').length;

    // B) Clientes de este mes
    const ahora = new Date();
    // Crea una fecha seteada al día 1, a las 00:00:00 del mes actual
    const primerDiaDelMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const clientesEsteMes = clients.filter(client => {
        const fechaCreacion = new Date(client.creado_en);
        return fechaCreacion >= primerDiaDelMes;
    }).length;

    // C) Total de Notas
    // Suma la longitud del arreglo 'notes' de cada cliente. 
    // Si un cliente no tiene notas, suma 0.
    const totalNotas = clients.reduce((acc, client) => acc + client._count.notes, 0);
    console.log(`totalNotas`, totalNotas);


    return (
        <>
            {/* Encabezado de página */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Panel de Control</h1>
                    <p className="page-subtitle">Resumen general de tu sistema CRM.</p>
                </div>
                <NewClientButton className="btn btn-primary">
                    <span>+</span>
                    Nuevo Cliente
                </NewClientButton>
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
                    <div className="stat-value">{activos}</div>
                    <div className="stat-change" style={{ color: 'var(--crm-text-muted)' }}>
                        En seguimiento
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Notas</div>
                    <div className="stat-value">{totalNotas}</div>
                    <div className="stat-change" style={{ color: 'var(--crm-text-muted)' }}>
                        Registradas en total
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Este Mes</div>
                    <div className="stat-value">{clientesEsteMes}</div>
                    <div className="stat-change" style={{ color: 'var(--crm-success)' }}>
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
                    <NewClientButton className="btn btn-primary">
                        <span>+</span>
                        Agregar Primer Cliente
                    </NewClientButton>
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
                                                    {client.nombre ? client.nombre.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{client.nombre}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--crm-text-secondary)' }}>{client.email}</td>
                                        <td style={{ color: 'var(--crm-text-secondary)' }}>{client.telefono || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link href={`/dashboard/clients/${client.id}`} className="btn btn-ghost btn-sm">Ver</Link>
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