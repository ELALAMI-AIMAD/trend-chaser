import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { Toaster } from "sonner"
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
    <html lang="en" className="dark">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              color: "var(--text)",
            },
          }}
        />
      </body>
    </html>
  )
}
