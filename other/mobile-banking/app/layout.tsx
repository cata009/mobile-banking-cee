import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mobile First RO",
  description: "Mobile banking app for UniCredit Bank Romania",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/mobile-banking/ro-app-icon.jpg",
    apple: "/assets/mobile-banking/ro-app-icon.jpg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
