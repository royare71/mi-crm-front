'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

const mainNav: NavItem[] = [
    { label: 'Panel de Control', href: '/dashboard', icon: '📊' },
    { label: 'Clientes', href: '/dashboard/clients', icon: '👥' },
];

const settingsNav: NavItem[] = [
    { label: 'Configuración', href: '/dashboard/settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    // Estado para controlar si el menú móvil está abierto o cerrado
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    // Función para cerrar el menú cuando tocan un enlace en el celular
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* 1. HEADER MÓVIL (Solo visible en celulares) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-4 justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none"
                    >
                        {/* Ícono de Hamburguesa */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-bold text-gray-800 text-lg">CRM Pro</span>
                </div>
                {/* UserButton de Clerk en el header móvil para que puedan salir de su sesión */}
                <div>
                    <UserButton appearance={{ elements: { avatarBox: { width: '32px', height: '32px' } } }} />
                </div>
            </div>

            {/* 2. FONDO OSCURO (Solo en móvil cuando el menú está abierto) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                    onClick={closeSidebar} // Si tocan lo negro, se cierra
                />
            )}

            {/* 3. TU SIDEBAR PRINCIPAL */}
            {/* Se mantiene tu clase "sidebar" pero se agregan clases de Tailwind para moverlo */}
            <aside
                className={`sidebar fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">C</div>
                    <span className="sidebar-brand-text">CRM Pro</span>
                </div>

                {/* Navegación principal */}
                <nav className="sidebar-section">
                    <div className="sidebar-section-title">Principal</div>
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeSidebar} // Cierra el menú al hacer clic
                            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Configuración */}
                <nav className="sidebar-section">
                    <div className="sidebar-section-title">Sistema</div>
                    {settingsNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeSidebar} // Cierra el menú al hacer clic
                            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer con usuario */}
                <div className="sidebar-footer">
                    <div className="flex items-center gap-3">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: { width: '32px', height: '32px' },
                                },
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-white font-medium leading-none mb-1">
                                Mi Perfil
                            </span>
                            <span className="text-xs text-white/50 leading-none">
                                Configuración
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}