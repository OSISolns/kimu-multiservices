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
        @keyframes line-horizontal {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100vw; opacity: 0; }
        }
        @keyframes line-vertical {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100vh; opacity: 0; }
        }
        @keyframes line-diagonal1 {
          0% { left: 0; top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100vw; top: 100vh; opacity: 0; }
        }
        @keyframes line-diagonal2 {
          0% { left: 100vw; top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 0; top: 100vh; opacity: 0; }
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
      {/* Horizontal Line */}
      <div style={{position:'absolute',top:'10%',left:0,width:'100vw',height:'4px',background:'rgba(59,130,246,0.5)',animation:'line-horizontal 8s linear infinite',zIndex:1}} />
      {/* Vertical Line */}
      <div style={{position:'absolute',left:'20%',top:0,width:'4px',height:'100vh',background:'rgba(251,146,60,0.5)',animation:'line-vertical 10s linear infinite',zIndex:1}} />
      {/* Diagonal Line 1 */}
      <div style={{position:'absolute',left:0,top:0,width:'4px',height:'100vh',background:'linear-gradient(135deg,rgba(16,185,129,0.5),rgba(59,130,246,0.5))',transform:'rotate(45deg)',animation:'line-diagonal1 12s linear infinite',zIndex:1}} />
      {/* Diagonal Line 2 */}
      <div style={{position:'absolute',left:'100vw',top:0,width:'4px',height:'100vh',background:'linear-gradient(225deg,rgba(251,146,60,0.5),rgba(59,130,246,0.5))',transform:'rotate(-45deg)',animation:'line-diagonal2 14s linear infinite',zIndex:1}} />
    </div>
  );
} 