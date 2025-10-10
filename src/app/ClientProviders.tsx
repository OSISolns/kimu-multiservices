'use client';

import { UserProvider } from './UserContext';
import FloatingBackground from '@/components/FloatingBackground';
import { ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <UserProvider>
      <FloatingBackground />
      {children}
    </UserProvider>
  );
}
