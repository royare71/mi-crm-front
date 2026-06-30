'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';

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
        <div className="w-full max-w-7xl mx-auto pb-10">
            {/* Cabecera Responsiva */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-800 text-sm mb-2 bg-transparent border-none cursor-pointer p-0 transition-colors"
                    >
                        &larr; Volver
                    </button>
                    <h1 className="page-title text-2xl md:text-3xl font-bold">{client.nombre}</h1>
                    <p className="page-subtitle text-gray-600 mt-1">{client.empresa || 'Sin empresa'} - {client.email}</p>
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <button className="btn flex-1 md:flex-none btn-secondary whitespace-nowrap" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Cancelar' : 'Editar'}
                    </button>
                    <button className="btn flex-1 md:flex-none btn-primary whitespace-nowrap" onClick={handleDeleteClient} disabled={isDeleting} style={{ background: 'var(--crm-danger)' }}>
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>

            {/* Grid Responsivo: 1 columna en móvil, 2 en pantallas grandes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Lado izquierdo: Info y Edición */}
                <div className="card shadow-sm rounded-lg border border-gray-200 bg-white">
                    <div className="card-header border-b border-gray-100 p-4">
                        <h3 className="text-lg font-semibold">Información del Cliente</h3>
                    </div>
                    <div className="card-body p-4 md:p-6">
                        {isEditing ? (
                            <form onSubmit={handleUpdateClient} className="flex flex-col gap-4">
                                <div className="form-group">
                                    <label className="label block mb-1 text-sm font-medium">Nombre</label>
                                    <input className="input w-full" value={nombre} onChange={e => setNombre(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="label block mb-1 text-sm font-medium">Empresa</label>
                                    <input className="input w-full" value={empresa} onChange={e => setEmpresa(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="label block mb-1 text-sm font-medium">Email</label>
                                    <input className="input w-full" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="label block mb-1 text-sm font-medium">Teléfono</label>
                                    <input className="input w-full" value={telefono} onChange={e => setTelefono(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="label block mb-1 text-sm font-medium">Estado</label>
                                    <select className="input w-full" value={estado} onChange={e => setEstado(e.target.value)}>
                                        <option value="LEAD">LEAD</option>
                                        <option value="ACTIVO">ACTIVO</option>
                                        <option value="INACTIVO">INACTIVO</option>
                                        <option value="PERDIDO">PERDIDO</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary w-full mt-2" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-4 text-sm md:text-base">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <strong className="text-gray-700">Estado:</strong>
                                    <span className="badge badge-success px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: estado === 'ACTIVO' ? 'var(--crm-success)' : estado === 'LEAD' ? 'var(--crm-accent)' : 'var(--crm-text-muted)' }}>
                                        {client.estado}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <strong className="text-gray-700">Teléfono:</strong>
                                    <span className="text-gray-600">{client.telefono || 'No especificado'}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <strong className="text-gray-700">Email:</strong>
                                    <span className="text-gray-600 truncate max-w-[200px] sm:max-w-xs">{client.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <strong className="text-gray-700">Registrado:</strong>
                                    <span className="text-gray-600">{new Date(client.notes[0]?.creado_en || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado derecho: Notas */}
                <div className="card shadow-sm rounded-lg border border-gray-200 bg-white">
                    <div className="card-header border-b border-gray-100 p-4">
                        <h3 className="text-lg font-semibold">Notas e Interacciones</h3>
                    </div>
                    <div className="card-body p-4 md:p-6">
                        <form onSubmit={handleAddNote} className="mb-6 flex flex-col gap-3">
                            <textarea
                                className="input w-full p-3 rounded-md"
                                placeholder="Escribe una nueva nota o interacción..."
                                style={{ minHeight: '80px', resize: 'vertical' }}
                                value={newNoteContent}
                                onChange={e => setNewNoteContent(e.target.value)}
                            />
                            {/* Controles de la nota responsivos */}
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <select className="input w-full sm:w-auto" value={newNoteType} onChange={e => setNewNoteType(e.target.value)}>
                                    <option value="NOTA">NOTA</option>
                                    <option value="LLAMADA">LLAMADA</option>
                                    <option value="CORREO">CORREO</option>
                                    <option value="REUNION">REUNION</option>
                                    <option value="SEGUIMIENTO">SEGUIMIENTO</option>
                                </select>
                                <button type="submit" className="btn btn-primary w-full sm:w-auto flex-1" disabled={savingNote || !newNoteContent.trim()}>
                                    {savingNote ? 'Agregando...' : 'Agregar Nota'}
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-col gap-3">
                            {client.notes.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-6">No hay notas registradas para este cliente.</p>
                            ) : (
                                client.notes.map(note => (
                                    <div key={note.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                                        <div className="flex justify-between items-start md:items-center mb-3">
                                            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                                                {note.tipo_interaccion}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 hidden sm:inline-block">
                                                    {new Date(note.creado_en).toLocaleString()}
                                                </span>
                                                <span className="text-xs text-gray-500 sm:hidden">
                                                    {new Date(note.creado_en).toLocaleDateString()}
                                                </span>
                                                <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors text-lg font-bold leading-none">
                                                    &times;
                                                </button>
                                            </div>
                                        </div>
                                        <p className="m-0 text-sm md:text-base text-gray-800 whitespace-pre-wrap">{note.contenido}</p>
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