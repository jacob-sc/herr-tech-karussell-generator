import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Karussell-Generator',
  description: 'Instagram-Karussells in deinem Branding — in 90 Sekunden generiert.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
