import { Geist, Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils";
import Footer from "@/components/footer/footer";

const outfitHeading = Outfit({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable, outfitHeading.variable)}
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <main className="flex-1">
            {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
