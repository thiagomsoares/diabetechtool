import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { LogProvider } from "./contexts/LogContext";
import { LogViewer } from "./components/LogViewer";
import { LoadingProvider } from './contexts/LoadingContext';
import { GlobalLoading } from './components/GlobalLoading';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DiabetechFree",
  description: "Análise de dados do Nightscout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AppProvider>
          <LoadingProvider>
            <LogProvider>
              <GlobalLoading />
              {children}
              <LogViewer />
            </LogProvider>
          </LoadingProvider>
        </AppProvider>
      </body>
    </html>
  );
} 