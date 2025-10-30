export const metadata = {
  title: 'Authentication - Next.js Template',
  description: 'Sign in, sign up, and manage your account',
}

import { auth as a } from "@/lib/styles"
import { AuthGraphic } from "@/components/website-components"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={a.page}>
      <main className={a.main}>
        <div className={a.split}>
          {/* Graphic half - client-rendered */}
          <div className={a.graphicPane}>
            <AuthGraphic />
          </div>

          {/* Form half */}
          <div className={a.formPane}>
            <div className={a.formCenter}>
              <div className={a.formMax}>{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
