'use client';

import { UserProvider } from './UserContext';
import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
