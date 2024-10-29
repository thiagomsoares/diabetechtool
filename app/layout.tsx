import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from 'react';
import { AppProvider } from './contexts/AppContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Diabetech - Dashboard Inteligente",
  description: "Análise avançada de dados do Nightscout para pacientes com Diabetes Tipo 1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
} 