import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '文本阅读器',
  description: '支持高亮标注的文本阅读器',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {children}
        </main>
      </body>
    </html>
  )
} 