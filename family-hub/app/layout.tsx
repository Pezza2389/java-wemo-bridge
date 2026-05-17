import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { HouseholdProvider } from '@/context/HouseholdContext'
import { ToastProvider } from '@/context/ToastContext'
import { BottomNav } from '@/components/layout/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FamilyOS',
  description: 'Shared family life management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FamilyOS',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FamilyOS" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} bg-slate-50`}>
        <HouseholdProvider>
          <ToastProvider>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
              <main style={{ flex: 1, overflowY: 'auto' }}>
                {children}
              </main>
              <BottomNav />
            </div>
          </ToastProvider>
        </HouseholdProvider>
      </body>
    </html>
  )
}
