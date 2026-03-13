import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "@/components/ClientProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "SEO Dashboard - Local SEO Automation",
  description: "Multi-client local SEO automation tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans" suppressHydrationWarning>
        <ClientProvider>
          <AppShell>{children}</AppShell>
        </ClientProvider>
      </body>
    </html>
  );
}
