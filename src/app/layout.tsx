import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider"
import React from "react";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {SiteHeader} from "@/components/site-header";
import {ContextProvider} from "@/context/context";
import LoadingSpinner from '../components/LoadingSpinner';   // Ajusta la ruta

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


export const metadata: Metadata = {
    title: "Assemblies CO.",
    description: "Assemblies CO.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ContextProvider>
            <LoadingSpinner />
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset"/>
                    <SidebarInset>
                        <SiteHeader/>
                        <div className="flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2">
                                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </ThemeProvider>
        </ContextProvider>
        </body>
        </html>
    )
        ;
}
