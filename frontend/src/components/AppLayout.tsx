import { ReactNode } from 'react';
import TanStackProvider from '@/providers/TanStackProvider';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <TanStackProvider>
      {children}
    </TanStackProvider>
  );
}
