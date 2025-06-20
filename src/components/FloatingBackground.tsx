"use client"
import React, { useEffect, useState } from 'react';

interface Floatie {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  scale: number;
}

export default function FloatingBackground() {
  const [floaties, setFloaties] = useState<Floatie[]>([]);

  useEffect(() => {
    // Create initial floaties
    const initialFloaties = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
      scale: Math.random() * 0.4 + 0.8,
    }));
    setFloaties(initialFloaties);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(10px, -15px) scale(1.1) rotate(5deg);
          }
          50% {
            transform: translate(-5px, -25px) scale(0.9) rotate(-5deg);
          }
          75% {
            transform: translate(-15px, -15px) scale(1.05) rotate(5deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
        }
      `}</style>
      {floaties.map((floatie) => (
        <div
          key={floatie.id}
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
          style={{
            left: `${floatie.x}%`,
            top: `${floatie.y}%`,
            width: `${floatie.size}px`,
            height: `${floatie.size}px`,
            opacity: floatie.opacity,
            transform: `scale(${floatie.scale})`,
            animation: `float ${floatie.duration}s ease-in-out ${floatie.delay}s infinite`,
            filter: 'blur(1px)',
            transition: 'all 0.3s ease-in-out',
          }}
        />
      ))}
    </div>
  );
} 