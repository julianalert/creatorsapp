import './css/style.css'

import { Inter } from 'next/font/google'
import Theme from './theme-provider'
import AppProvider from './app-provider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Get the base URL for metadata
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL)
  }
  // Fallback for production
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`)
  }
  // Development fallback
  return new URL('https://yuzuu.app')
}

export const metadata = {
  metadataBase: getBaseUrl(),
  title: {
    default: 'Yuzuu - AI Agents for Marketing',
    template: '%s | Yuzuu',
  },
  description: 'Pre-made, ready-to-use and fully customizable AI agents for marketing. No fluff. Just laser focused agents helping you every day.',
  keywords: [
    'AI agents',
    'marketing automation',
    'SEO agents',
    'content marketing',
    'sales automation',
    'creator marketing',
    'paid ads',
    'marketing tools',
    'AI marketing',
    'marketing AI',
  ],
  authors: [{ name: 'Yuzuu' }],
  creator: 'Yuzuu',
  publisher: 'Yuzuu',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/images/logo.svg',
    shortcut: '/images/logo.svg',
    apple: '/images/logo.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Yuzuu',
    title: 'Yuzuu - AI Agents for Marketing',
    description: 'Pre-made, ready-to-use and fully customizable AI agents for marketing. No fluff. Just laser focused agents helping you every day.',
    images: [
      {
        url: '/images/thubmnail.png',
        width: 1200,
        height: 630,
        alt: 'Yuzuu - AI Agents for Marketing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yuzuu - AI Agents for Marketing',
    description: 'Pre-made, ready-to-use and fully customizable AI agents for marketing. No fluff. Just laser focused agents helping you every day.',
    images: ['/images/thubmnail.png'],
    creator: '@yuzuu',
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
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>{/* suppressHydrationWarning: https://github.com/vercel/next.js/issues/44343 */}
      <body className="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <Theme>
          <AppProvider>
            {children}
          </AppProvider>
        </Theme>
      </body>
    </html>
  )
}
