import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayoutWrapper from './ClientLayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
  description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
  metadataBase: new URL('https://www.kimutransport.co.rw'),
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.kimutransport.co.rw',
    title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
    description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
    siteName: 'KIMU Transport & Multiservices',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'KIMU Transport Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KIMU Transport & Multiservices - Car Rental & Tour Services in Rwanda',
    description: 'Professional car rental services and guided tours in Rwanda. Offering self-drive, chauffeur-driven cars, and comprehensive tour packages.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  )
}
