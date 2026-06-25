import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations'; // Opcional: para poner el login en español
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}