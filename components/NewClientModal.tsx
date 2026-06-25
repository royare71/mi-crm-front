'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';

interface NewClientModalProps {
    onClose: () => void;
    onClientCreated: (client: { id: string; nombre: string; email: string; telefono?: string; empresa?: string }) => void;
}

export default function NewClientModal({ onClose, onClientCreated }: NewClientModalProps) {
    const { getToken } = useAuth();
    const [name, setName] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validación básica
        if (!name.trim() || !email.trim()) {
            setError('El nombre y correo son obligatorios.');
            return;
        }

        setSaving(true);

        try {
            const token = await getToken();
            const res = await fetchWithAuth('/api/clients', token, {
                method: 'POST',
                body: JSON.stringify({
                    nombre: name.trim(),
                    empresa: empresa.trim() || undefined,
                    email: email.trim(),
                    telefono: phone.trim() || undefined,
                    estado: 'ACTIVO'
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Error al crear el cliente.');
            }

            const newClient = await res.json();
            onClientCreated(newClient);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error inesperado. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Nuevo Cliente</h2>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onClose}
                        type="button"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="client-name" className="label">
                                Nombre <span style={{ color: 'var(--crm-danger)' }}>*</span>
                            </label>
                            <input
                                id="client-name"
                                type="text"
                                className="input"
                                placeholder="Ej. Juan Pérez"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="client-empresa" className="label">
                                Empresa <span style={{ color: 'var(--crm-text-muted)', fontWeight: 400 }}>(opcional)</span>
                            </label>
                            <input
                                id="client-empresa"
                                type="text"
                                className="input"
                                placeholder="Ej. Industrias Stark"
                                value={empresa}
                                onChange={(e) => setEmpresa(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="client-email" className="label">
                                Correo Electrónico <span style={{ color: 'var(--crm-danger)' }}>*</span>
                            </label>
                            <input
                                id="client-email"
                                type="email"
                                className="input"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="client-phone" className="label">
                                Teléfono <span style={{ color: 'var(--crm-text-muted)', fontWeight: 400 }}>(opcional)</span>
                            </label>
                            <input
                                id="client-phone"
                                type="tel"
                                className="input"
                                placeholder="+52 55 1234 5678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Guardando…' : 'Guardar Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
