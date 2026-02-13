import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from '@/components/features/auth/SessionWrapper';
import { ModalProvider } from '@/contexts/ModalContext';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Property Management System",
    description: "Manage your properties and track appliance maintenance",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <SessionWrapper>
            <ModalProvider>
                {children}
            </ModalProvider>
        </SessionWrapper>
        </body>
        </html>
    );
}
