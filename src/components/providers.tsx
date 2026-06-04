'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      {children}
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  )
}
