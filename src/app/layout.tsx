import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Balance Tracker',
  description: 'Prepaid balance management for small businesses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">{children}</body>
    </html>
  )
}
