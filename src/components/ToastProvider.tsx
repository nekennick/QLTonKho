'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontSize: '14px',
          fontFamily: 'var(--font-nunito-sans)',
          fontWeight: '500',
          padding: '12px 16px',
          minWidth: '300px',
        },
        success: {
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: 'hsl(var(--primary-foreground))',
          },
          style: {
            border: '1px solid hsl(var(--primary))',
            background: 'hsl(var(--primary) / 0.1)',
            color: 'hsl(var(--primary))',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(var(--destructive))',
            secondary: 'hsl(var(--destructive-foreground))',
          },
          style: {
            border: '1px solid hsl(var(--destructive))',
            background: 'hsl(var(--destructive) / 0.1)',
            color: 'hsl(var(--destructive))',
          },
        },
        loading: {
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: 'hsl(var(--primary-foreground))',
          },
          style: {
            border: '1px solid hsl(var(--primary))',
            background: 'hsl(var(--primary) / 0.1)',
            color: 'hsl(var(--primary))',
          },
        },
      }}
    />
  );
}
