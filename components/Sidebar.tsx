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
    { label: 'Clientes', href: '/dashboard/clientes', icon: '👥' },
];

const settingsNav: NavItem[] = [
    { label: 'Configuración', href: '/dashboard/configuracion', icon: '⚙️' },
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

            {/* Footer con usuario */}
            <div className="sidebar-footer">
                <div className="sidebar-link" style={{ cursor: 'default' }}>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: { width: '28px', height: '28px' },
                            },
                        }}
                    />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        Mi Cuenta
                    </span>
                </div>
            </div>
        </aside>
    );
}
