import React from 'react'
import { Toaster } from '@/components/ui/sonner'
import './styles.css'

export const metadata = {
  description: 'Formulir Pendaftaran Umrah - Rehlatours',
  title: 'Formulir Pendaftaran Umrah - Rehlatours',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
