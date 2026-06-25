import { redirect } from 'next/navigation';

export default function HomePage() {
    // Redirige automáticamente a cualquier persona que entre a la raíz
    redirect('/dashboard');
}