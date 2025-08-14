import React from 'react';
import Sidebar from './Sidebar';
import Providers from '@/components/Providers';
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Companies Directory',
  description: 'Search, Screen and Explore',
  keywords: 'market cap, companies, stocks, valuation, finance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{margin:0,padding:0,overflowX:'hidden',fontFamily:"'Montserrat','Inter',Arial,sans-serif"}}>
        <Providers>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '0 24px', overflowX: 'hidden' }}>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
