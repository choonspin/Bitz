import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bitz', // Changed to Bitz
  description: 'A simple habit tracker app built with Next.js and Electron.', // Improved description
  // generator: 'v0.dev', // Optionally remove or keep if relevant
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
