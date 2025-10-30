"use client"

import { motion } from "framer-motion"

export function AuthGraphic() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <motion.div
        initial={{ opacity: 0.2, x: -50 }}
        animate={{ opacity: 0.35, x: 50 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      <motion.div
        initial={{ y: 10, opacity: 0.2 }}
        animate={{ y: -10, opacity: 0.3 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5"
      />
      <motion.div
        initial={{ y: -8, opacity: 0.15 }}
        animate={{ y: 8, opacity: 0.25 }}
        transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="absolute bottom-10 left-8 h-52 w-52 rounded-full bg-white/5"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05),transparent_40%)]" />
    </div>
  )
}


