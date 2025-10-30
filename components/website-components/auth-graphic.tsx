"use client"

import { motion } from "framer-motion"

// Equilateral triangles only (clean, bold motion)
export function AuthGraphic() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Squares (3) */}
      {[
        { color: 'rgba(34,211,238,0.7)', fill: 'rgba(34,211,238,0.25)', sz: 48, d: 5.2, start: { x: -140, y: 100, r: 0, o: 0.5 }, end: { x: 140, y: -90, r: 120, o: 0.85 } },
        { color: 'rgba(232,121,249,0.8)', fill: 'rgba(232,121,249,0.28)', sz: 36, d: 4.8, start: { x: 140, y: 120, r: 10, o: 0.45 }, end: { x: -110, y: -70, r: 140, o: 0.8 } },
        { color: 'rgba(52,211,153,0.8)',  fill: 'rgba(52,211,153,0.28)',  sz: 28, d: 4.6, start: { x: -90, y: -30, r: -15, o: 0.45 }, end: { x: 90, y: 50, r: 90, o: 0.78 } },
      ].map((s, i) => (
        <motion.div
          key={`sq-${i}`}
          initial={{ x: s.start.x, y: s.start.y, rotate: s.start.r, opacity: s.start.o }}
          animate={{ x: s.end.x, y: s.end.y, rotate: s.end.r, opacity: s.end.o }}
          transition={{ duration: s.d, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/3"
          style={{
            marginTop: -s.sz,
            marginLeft: -s.sz,
            width: s.sz,
            height: s.sz,
            backgroundColor: s.fill,
            border: `1px solid ${s.color}`,
          }}
        />
      ))}

      {/* Circles (3) */}
      {[
        { color: 'rgba(251,191,36,0.95)', sz: 72, d: 5,   start: { x: -80, y: -60, s: 0.92, o: 0.5 },  end: { x: 80, y: 60, s: 1.14, o: 0.88 } },
        { color: 'rgba(165,180,252,0.95)', sz: 44, d: 4.6, start: { x: 120, y: -20, s: 0.95, o: 0.45 }, end: { x: -100, y: 40, s: 1.15, o: 0.85 } },
        { color: 'rgba(253,164,175,0.95)', sz: 32, d: 4.3, start: { x: 60, y: 100, s: 0.92, o: 0.45 }, end: { x: -60, y: -100, s: 1.1, o: 0.82 } },
      ].map((c, i) => (
        <motion.div
          key={`cr-${i}`}
          initial={{ x: c.start.x, y: c.start.y, scale: c.start.s, opacity: c.start.o }}
          animate={{ x: c.end.x, y: c.end.y, scale: c.end.s, opacity: c.end.o }}
          transition={{ duration: c.d, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/2 rounded-full"
          style={{
            marginTop: -c.sz / 2,
            marginLeft: -c.sz / 2,
            width: c.sz,
            height: c.sz,
            border: `2px solid ${c.color}`,
          }}
        />
      ))}
      {/* Equilateral Triangles (4) */}
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


