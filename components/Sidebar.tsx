'use client';

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

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <aside className="sidebar">
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
                        className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Footer con usuario — Migrado a utilidades Tailwind para evitar bloqueos CSS */}
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
    );
}