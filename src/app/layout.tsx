import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Karussell-Generator — Herr Tech',
  description: 'Instagram-Karussells in deinem Branding — in 90 Sekunden generiert.',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col">
        <nav className="px-6 sm:px-8 h-14 border-b border-border flex items-center gap-3 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/herr-tech-logo.png" alt="HERR TECH" className="h-[18px] object-contain" />
          <span className="text-sm text-muted">/ karussell-generator</span>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border px-6 sm:px-8 py-4 text-xs text-muted text-center shrink-0">
          © herr.tech · Karussell-Generator · Built with{' '}
          <a
            href="https://github.com/jacob-sc/herr-tech-karussell-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Herr Tech Starter Tools
          </a>
        </footer>
      </body>
    </html>
  )
}
