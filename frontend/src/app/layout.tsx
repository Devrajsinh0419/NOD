import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'
import SessionManager from '@/components/auth/SessionManager'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: {
    default: 'Night Owl Designers (NOD) | Architectural & Interior Design Marketplace',
    template: '%s | Night Owl Designers (NOD)',
  },
  description: 'Night Owl Designers (NOD) is a premium marketplace connecting visionary clients with architects, interior designers, contractors, and government tender opportunities in India.',
  keywords: [
    'Government Tenders India',
    'Interior Designers India',
    'Architects India',
    'Contractors India',
    'Construction Marketplace',
    'Design Marketplace',
    'Tender Discovery Platform',
    'Architecture India',
    'NOD India',
  ],
  authors: [{ name: 'Night Owl Designers' }],
  creator: 'Night Owl Designers',
  metadataBase: new URL('https://nod-live.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://nod-live.vercel.app',
    title: 'Night Owl Designers (NOD) | Architectural & Interior Design Marketplace',
    description: 'Premium platform connecting clients with top architects, interior designers, contractors, and government tenders across India.',
    siteName: 'Night Owl Designers',
    images: [
      {
        url: '/images/logo.png',
        width: 600,
        height: 600,
        alt: 'Night Owl Designers (NOD)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Night Owl Designers (NOD) | Design & Tender Marketplace',
    description: 'Premium platform connecting clients with top architects, interior designers, contractors, and government tenders across India.',
    images: ['/images/logo.png'],
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://nominatim.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://nominatim.openstreetmap.org" />
      </head>
      <body>
        {children}
        <SessionManager />
      </body>
    </html>
  )
}
