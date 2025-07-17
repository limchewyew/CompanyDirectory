import React from 'react';
import Sidebar from './Sidebar';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Companies Market Cap Directory',
  description: 'List of the world\'s biggest companies by market capitalization',
  keywords: 'market cap, companies, stocks, valuation, finance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{margin:0,padding:0,overflowX:'hidden'}}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '0 24px', overflowX: 'hidden' }}>{children}</main>
        </div>
      </body>
    </html>
  )
}
