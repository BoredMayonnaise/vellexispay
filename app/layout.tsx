import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'vellexispay — routing dashboard',
  description: 'Multi-tier model routing: load, cost, and shed visibility.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-surface text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  )
}