"use client"

import "@/components/ui/globals.css"
import { Inter } from "next/font/google"
import { useEffect } from "react"
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Remove browser extension attributes on the client side
  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
      const attributesToRemove = [];
      for (let i = 0; i < body.attributes.length; i++) {
        const attr = body.attributes[i];
        if (attr.name.startsWith('data-') || attr.name.includes('-gr-')) {
          attributesToRemove.push(attr.name);
        }
      }
      attributesToRemove.forEach(attr => {
        body.removeAttribute(attr);
      });
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SmartTransit - AI-Driven Public Transport Optimization</title>
        <meta name="description" content="Dynamic route optimization based on real-time data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add Leaflet CSS link */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        
        {/* Remove Grammarly and other browser extension attributes */}
        <Script id="remove-extension-attrs" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              const body = document.querySelector('body');
              if (body) {
                const attrs = Array.from(body.attributes);
                attrs.forEach(attr => {
                  if (attr.name.startsWith('data-gr-') || attr.name.includes('-gr-')) {
                    body.removeAttribute(attr.name);
                  }
                });
              }
            });
            
            // Override attribute setting
            const originalSetAttribute = Element.prototype.setAttribute;
            Element.prototype.setAttribute = function(name, value) {
              if (this.tagName === 'BODY' && (name.startsWith('data-gr-') || name.includes('-gr-'))) {
                return;
              }
              return originalSetAttribute.call(this, name, value);
            };
          `}
        </Script>
      </body>
    </html>
  )
}

import './globals.css'