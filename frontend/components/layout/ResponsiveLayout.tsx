'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '../common/ErrorBoundary';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className={`flex-1 ${className}`}>
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}