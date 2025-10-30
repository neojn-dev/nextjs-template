"use client"

import Link from "next/link"
import { Building2, Shield } from "lucide-react"
import { layout, footer as f } from "@/lib/styles"

export function AppFooter() {
  return (
    <footer className={f.shell}>
      <div className={layout.container}>
        <div className={f.bar}>
          {/* Left Side - Brand and Copyright */}
          <div className={f.left}>
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className={f.smallMuted}>
              © 2024 AdminPanel. All rights reserved.
            </span>
          </div>

          {/* Center - Status */}
          <div className={f.center}>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
          </div>

          {/* Right Side - Links and Version */}
          <div className={f.right}>
            <Link href="/help" className={f.link}>
              Help
            </Link>
            <Link href="/privacy" className={f.link}>
              Privacy
            </Link>
            <span className="text-xs">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}