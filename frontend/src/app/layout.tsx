import './globals.css'
import { Metadata } from 'next'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
