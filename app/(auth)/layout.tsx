export const metadata = {
  title: 'Authentication - Next.js Template',
  description: 'Sign in, sign up, and manage your account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <main className="flex-1 pt-20 lg:pt-24 pb-8">
        {children}
      </main>
    </div>
  )
}
