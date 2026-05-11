import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const shouldBypassClerkInDev = process.env.NODE_ENV === "development" && !isClerkConfigured;

export const metadata: Metadata = {
  title: "Trend Chaser",
  description: "Daily POD trend intelligence for Amazon Merch, Etsy, and Redbubble sellers."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        {shouldBypassClerkInDev ? (
          children
        ) : (
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: "#ff6a1a",
                colorBackground: "#12161a",
                colorInputBackground: "#0d1013",
                colorInputText: "rgba(255, 255, 255, 0.92)",
                colorText: "rgba(255, 255, 255, 0.92)",
                colorTextSecondary: "rgba(255, 255, 255, 0.62)"
              },
              elements: {
                cardBox: "clerk-card-box",
                card: "clerk-card",
                footer: "clerk-footer",
                formButtonPrimary: "clerk-primary-button"
              }
            }}
          >
            <ConvexClientProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        )}
      </body>
    </html>
  );
}
