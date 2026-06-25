'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';

interface UserData {
    id: string;
    email: string;
    nombre: string;
    role: 'ADMIN' | 'USER';
    creado_en: string;
    _count: {
        clients: number;
    };
}

export default function SettingsClient({ initialUsers }: { initialUsers: UserData[] }) {
    const [users, setUsers] = useState<UserData[]>(initialUsers);
    const { getToken, userId } = useAuth();

    const handleRoleChange = async (targetUserId: string, newRole: 'ADMIN' | 'USER') => {
        try {
            const token = await getToken();
            const res = await fetchWithAuth(`/api/users/${targetUserId}/role`, token, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(users.map(u => u.id === targetUserId ? { ...u, role: updatedUser.role } : u));
            } else {
                const errorData = await res.json().catch(() => null);
                alert(`Error al actualizar rol: ${errorData?.message || 'Revisa tus permisos'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className="page-header" style={{ marginBottom: '20px' }}>
                <div>
                    <h1 className="page-title">Configuración y Permisos</h1>
                    <p className="page-subtitle">Administra los accesos de tu equipo al CRM.</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Usuarios Registrados</h3>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                    <table className="table-crm">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Clientes Asignados</th>
                                <th>Rol / Permisos</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
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
                                                {user.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>
                                                {user.nombre}
                                                {user.id === userId && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--crm-text-muted)' }}>(Tú)</span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--crm-text-secondary)' }}>{user.email}</td>
                                    <td style={{ color: 'var(--crm-text-secondary)' }}>{user._count.clients} clientes</td>
                                    <td>
                                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-success' : 'badge-primary'}`} style={{ background: user.role === 'ADMIN' ? 'var(--crm-accent)' : 'var(--crm-surface)', color: user.role === 'ADMIN' ? '#fff' : 'var(--crm-text)' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {user.id !== userId && (
                                            <select 
                                                className="input" 
                                                style={{ width: 'auto', padding: '4px 8px', fontSize: '12px', minHeight: 'auto' }}
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as 'ADMIN' | 'USER')}
                                            >
                                                <option value="USER">Convertir en USER</option>
                                                <option value="ADMIN">Promover a ADMIN</option>
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
