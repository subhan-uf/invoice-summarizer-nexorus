"use client";

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--content1))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--divider))',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(10px)',
        },
        success: {
          iconTheme: {
            primary: 'hsl(var(--success))',
            secondary: 'hsl(var(--content1))',
          },
          style: {
            border: '1px solid hsl(var(--success))',
            background: 'hsl(var(--success) / 0.1)',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(var(--danger))',
            secondary: 'hsl(var(--content1))',
          },
          style: {
            border: '1px solid hsl(var(--danger))',
            background: 'hsl(var(--danger) / 0.1)',
          },
        },
        loading: {
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: 'hsl(var(--content1))',
          },
          style: {
            border: '1px solid hsl(var(--primary))',
            background: 'hsl(var(--primary) / 0.1)',
          },
        },
      }}
    />
  );
} 