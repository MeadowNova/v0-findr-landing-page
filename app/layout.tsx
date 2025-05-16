import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ChakraProvider } from '@chakra-ui/react'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Snagr AI | Your Personal Deal Hunter",
  description: "We hunt Facebook Marketplace so you don't have to. Tell us what you want, and we'll find it for you.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider>
          <Navbar />
          {children}
        </ChakraProvider>
      </body>
    </html>
  )
}
