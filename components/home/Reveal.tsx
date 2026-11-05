"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Fades and lifts its children in when scrolled into view. Content is visible without JavaScript and for reduced motion. */
export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" | "article" }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < innerHeight * 0.92) return;
    el.setAttribute("data-yg", "armed");
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { el.setAttribute("data-yg", "in"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as "div";
  return <T ref={ref as React.RefObject<HTMLDivElement>} className={`yg-rv ${className}`} style={{ transitionDelay: delay ? `${delay}ms` : undefined }}>{children}</T>;
}
