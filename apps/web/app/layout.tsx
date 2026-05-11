import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Trend Chaser",
  description: "POD Intelligence Dashboard"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
