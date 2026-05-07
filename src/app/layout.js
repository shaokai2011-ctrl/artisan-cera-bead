import { Geist, Geist_Mono } from 'next/font/google'
import { CartProvider } from '@/context/CartContext'
import { LanguageProvider } from '@/context/LanguageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VisitTracker from '@/components/VisitTracker'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'ArtisanCeraBead — 一珠一世界，一物一情感 | Handcrafted Ceramic Beads & Bracelets',
  description: 'Handcrafted ceramic beads and bracelets from Jingdezhen. 源自景德镇的手工陶瓷珠串与手串。一珠一世界，一物一情感。',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-stone-900 font-sans">
        <LanguageProvider>
          <CartProvider>
            <Header />
            <VisitTracker />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
