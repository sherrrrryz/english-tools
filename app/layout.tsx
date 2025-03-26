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
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
          <div className="container mx-auto px-4 py-6 max-w-5xl">
            <h1 className="text-2xl font-bold">文本阅读器</h1>
            <p className="text-blue-100 mt-1">轻松阅读和高亮标注你的文本</p>
          </div>
        </header>
        <div className="container mx-auto px-4 max-w-5xl">
          {/* 导航栏在此处注入，在客户端渲染 */}
        </div>
        <main className="container mx-auto px-4 py-4 max-w-5xl">
          {children}
        </main>
        <footer className="bg-gray-100 border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-6 max-w-5xl text-center text-gray-500 text-sm">
            文本阅读器 &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </body>
    </html>
  )
} 