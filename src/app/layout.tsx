import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { FinanceProvider } from '@/lib/FinanceContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'FinTrack',
  description: 'Personal Finance Tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <FinanceProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-[240px] min-h-screen bg-[#FAFAFA]">
              {children}
            </main>
          </div>
        </FinanceProvider>
      </body>
    </html>
  )
}
