
import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Tournament Manager
        </div>
      </footer>
    </div>
  );
};

export default Layout;
