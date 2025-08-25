"use client"
import React, { useRef, useEffect, useState, ElementType } from 'react'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  as?: ElementType
}

export default function AnimatedSection({
  children,
  className = '',
  as = 'section',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only use IntersectionObserver after mounting to avoid hydration mismatch
    if (!isMounted) return;
    
    const node = ref.current
    if (!node) return
    
    // Check if IntersectionObserver is available
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true)
            entry.target.classList.add('animate-fade-in')
            observer.unobserve(entry.target)
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(node)
      return () => {
        if (node) {
          observer.unobserve(node)
        }
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      setVisible(true)
    }
  }, [isMounted])

  const Component = as
  return (
    <Component
      ref={ref}
      className={
        className +
        ' transition-all duration-700 ease-out ' +
        (visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')
      }
    >
      {children}
    </Component>
  )
} 