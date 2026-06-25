import Sidebar from '@/components/Sidebar';

export const metadata = {
    title: 'CRM Pro — Panel de Control',
    description: 'Sistema de gestión de relaciones con clientes',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Sidebar />
            <div className="dashboard-layout">
                <header className="dashboard-topbar">
                    <div className="dashboard-topbar-left">
                        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--crm-text)' }}>
                            CRM Pro
                        </h2>
                    </div>
                    <div className="dashboard-topbar-right">
                        <span style={{ fontSize: '12px', color: 'var(--crm-text-muted)' }}>
                            v1.0
                        </span>
                    </div>
                </header>
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </>
    );
}
