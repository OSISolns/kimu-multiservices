"use client";

import { ReactNode } from 'react';
import { UserProvider } from './UserContext';

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
