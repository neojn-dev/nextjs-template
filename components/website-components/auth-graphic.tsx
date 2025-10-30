"use client"

import { motion } from "framer-motion"

// Equilateral triangles only (clean, bold motion)
export function AuthGraphic() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Equilateral Triangles (4) - doubled sizes */}
      {[
        // side length s, height b = 0.866*s for equilateral
        { color: 'rgba(167,139,250,0.9)', s: 96, b: 83, d: 5.2, start: { x: -100, y: 150, r: 0, o: 0.6 }, end: { x: 100, y: -130, r: 180, o: 0.9 } },
        { color: 'rgba(52,211,153,0.9)',  s: 72, b: 62, d: 4.8, start: { x: 110, y: -110, r: 20, o: 0.55 }, end: { x: -80, y: 80, r: 200, o: 0.88 } },
        { color: 'rgba(244,63,94,0.9)',   s: 64, b: 55, d: 4.5, start: { x: -60, y: -60, r: -15, o: 0.55 }, end: { x: 60, y: 60, r: 165, o: 0.85 } },
        { color: 'rgba(34,211,238,0.9)',  s: 56, b: 48, d: 4.2, start: { x: 70, y: 130, r: 0, o: 0.5 }, end: { x: -70, y: -130, r: 180, o: 0.8 } },
      ].map((t, i) => (
        <motion.div
          key={`tr-${i}`}
          initial={{ x: t.start.x, y: t.start.y, rotate: t.start.r, opacity: t.start.o }}
          animate={{ x: t.end.x, y: t.end.y, rotate: t.end.r, opacity: t.end.o }}
          transition={{ duration: t.d, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute"
          style={{
            top: '50%',
            left: '40%',
            width: 0,
            height: 0,
            borderLeft: `${t.s / 2}px solid transparent`,
            borderRight: `${t.s / 2}px solid transparent`,
            borderBottom: `${t.b}px solid ${t.color}`,
          }}
        />
      ))}
    </div>
  )
}


