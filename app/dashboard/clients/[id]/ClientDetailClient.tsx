'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';
import Link from 'next/link';

interface Note {
    id: string;
    contenido: string;
    tipo_interaccion: string;
    creado_en: string;
}

interface ClientData {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    empresa?: string;
    estado: string;
    notes: Note[];
}

export default function ClientDetailClient({ initialClient }: { initialClient: ClientData }) {
    const [client, setClient] = useState<ClientData>(initialClient);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state for editing client
    const [nombre, setNombre] = useState(client.nombre);
    const [email, setEmail] = useState(client.email);
    const [telefono, setTelefono] = useState(client.telefono || '');
    const [empresa, setEmpresa] = useState(client.empresa || '');
    const [estado, setEstado] = useState(client.estado);
    const [saving, setSaving] = useState(false);

    // Form state for notes
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteType, setNewNoteType] = useState('NOTA');
    const [savingNote, setSavingNote] = useState(false);

    const { getToken } = useAuth();
    const router = useRouter();

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = await getToken();
            const res = await fetchWithAuth(`/api/clients/${client.id}`, token, {
                method: 'PUT',
                body: JSON.stringify({
                    nombre,
                    email,
                    telefono: telefono || undefined,
                    empresa: empresa || undefined,
                    estado
                })
            });
            if (res.ok) {
                const updatedClient = await res.json();
                setClient({ ...client, ...updatedClient });
                setIsEditing(false);
                router.refresh();
            } else {
                alert('Error al actualizar el cliente');
            }
        } catch (error) {
            console.error(error);
            alert('Error de red');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClient = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar este cliente y todas sus notas? Esta acción no se puede deshacer.')) {
            return;
        }
        setIsDeleting(true);
        try {
            const token = await getToken();
            const res = await fetchWithAuth(`/api/clients/${client.id}`, token, {
                method: 'DELETE'
            });
            if (res.ok) {
                router.push('/dashboard/clients');
                router.refresh();
            } else {
                alert('Error al eliminar');
                setIsDeleting(false);
            }
        } catch (error) {
            console.error(error);
            alert('Error de red');
            setIsDeleting(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteContent.trim()) return;
        setSavingNote(true);
        try {
            const token = await getToken();
            const res = await fetchWithAuth(`/api/clients/${client.id}/notes`, token, {
                method: 'POST',
                body: JSON.stringify({
                    contenido: newNoteContent,
                    tipo_interaccion: newNoteType
                })
            });
            if (res.ok) {
                const newNote = await res.json();
                setClient({
                    ...client,
                    notes: [newNote, ...client.notes]
                });
                setNewNoteContent('');
            } else {
                alert('Error al agregar nota');
            }
        } catch (error) {
            console.error(error);
            alert('Error de red');
        } finally {
            setSavingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('¿Borrar nota?')) return;
        try {
            const token = await getToken();
            const res = await fetchWithAuth(`/api/clients/${client.id}/notes/${noteId}`, token, {
                method: 'DELETE'
            });
            if (res.ok) {
                setClient({
                    ...client,
                    notes: client.notes.filter(n => n.id !== noteId)
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '20px' }}>
                <div>
                    <button
                        onClick={() => router.back()}
                        style={{
                            color: 'var(--crm-text-muted)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            marginBottom: '8px',
                            display: 'inline-block',
                            background: 'transparent', // <- Quitamos el fondo gris del botón
                            border: 'none',            // <- Quitamos el borde
                            cursor: 'pointer',         // <- Ponemos la manita al pasar el mouse
                            padding: 0                 // <- Quitamos el relleno por defecto
                        }}
                    >
                        &larr; Volver
                    </button>
                    <h1 className="page-title">{client.nombre}</h1>
                    <p className="page-subtitle">{client.empresa || 'Sin empresa'} - {client.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Cancelar Edición' : 'Editar Cliente'}
                    </button>
                    <button className="btn btn-primary" onClick={handleDeleteClient} disabled={isDeleting} style={{ background: 'var(--crm-danger)' }}>
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                {/* Lado izquierdo: Info y Edición */}
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Información del Cliente</h3>
                    </div>
                    <div className="card-body" style={{ padding: '20px' }}>
                        {isEditing ? (
                            <form onSubmit={handleUpdateClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="label">Nombre</label>
                                    <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Empresa</label>
                                    <input className="input" value={empresa} onChange={e => setEmpresa(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Email</label>
                                    <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Teléfono</label>
                                    <input className="input" value={telefono} onChange={e => setTelefono(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Estado</label>
                                    <select className="input" value={estado} onChange={e => setEstado(e.target.value)}>
                                        <option value="LEAD">LEAD</option>
                                        <option value="ACTIVO">ACTIVO</option>
                                        <option value="INACTIVO">INACTIVO</option>
                                        <option value="PERDIDO">PERDIDO</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div><strong>Estado:</strong> <span className="badge badge-success" style={{ background: estado === 'ACTIVO' ? 'var(--crm-success)' : estado === 'LEAD' ? 'var(--crm-accent)' : 'var(--crm-text-muted)' }}>{client.estado}</span></div>
                                <div><strong>Teléfono:</strong> {client.telefono || 'No especificado'}</div>
                                <div><strong>Email:</strong> {client.email}</div>
                                <div><strong>Registrado:</strong> {new Date(client.notes[0]?.creado_en || Date.now()).toLocaleDateString()}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado derecho: Notas */}
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Notas e Interacciones</h3>
                    </div>
                    <div className="card-body" style={{ padding: '20px' }}>
                        <form onSubmit={handleAddNote} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <textarea
                                className="input"
                                placeholder="Escribe una nueva nota o interacción..."
                                style={{ minHeight: '80px', resize: 'vertical' }}
                                value={newNoteContent}
                                onChange={e => setNewNoteContent(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <select className="input" style={{ width: 'auto' }} value={newNoteType} onChange={e => setNewNoteType(e.target.value)}>
                                    <option value="NOTA">NOTA</option>
                                    <option value="LLAMADA">LLAMADA</option>
                                    <option value="CORREO">CORREO</option>
                                    <option value="REUNION">REUNION</option>
                                    <option value="SEGUIMIENTO">SEGUIMIENTO</option>
                                </select>
                                <button type="submit" className="btn btn-primary" disabled={savingNote || !newNoteContent.trim()}>
                                    {savingNote ? 'Agregando...' : 'Agregar Nota'}
                                </button>
                            </div>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {client.notes.length === 0 ? (
                                <p style={{ color: 'var(--crm-text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No hay notas registradas para este cliente.</p>
                            ) : (
                                client.notes.map(note => (
                                    <div key={note.id} style={{ background: 'var(--crm-surface)', border: '1px solid var(--crm-border)', borderRadius: '8px', padding: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--crm-accent)', background: 'var(--crm-accent-light)', padding: '2px 8px', borderRadius: '12px' }}>{note.tipo_interaccion}</span>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--crm-text-muted)' }}>{new Date(note.creado_en).toLocaleString()}</span>
                                                <button onClick={() => handleDeleteNote(note.id)} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>{note.contenido}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
