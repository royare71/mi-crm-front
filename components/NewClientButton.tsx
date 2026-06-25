'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NewClientModal from './NewClientModal';

interface Props {
    className?: string;
    children?: React.ReactNode;
}

export default function NewClientButton({ className = "btn btn-primary", children }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <button className={className} onClick={() => setIsOpen(true)}>
                {children || (
                    <>
                        <span>+</span> Nuevo Cliente
                    </>
                )}
            </button>

            {isOpen && (
                <NewClientModal
                    onClose={() => setIsOpen(false)}
                    onClientCreated={() => {
                        setIsOpen(false);
                        router.refresh();
                    }}
                />
            )}
        </>
    );
}
