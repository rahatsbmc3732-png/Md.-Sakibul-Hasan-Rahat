import React, { useEffect, useRef, useState } from 'react';

export const CursorManager: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;

    let glowOpacity = 0;
    let targetGlowOpacity = 0;

    const interactiveSelector =
      '.glass-card, #about-card, #latest-video-container, .shape-glow-card, .portfolio-card, .service-card, .stat-card, .tilt-card, .hero-badge, .tag-pill, .btn-primary, .btn-secondary, button, a, [role="button"], input, textarea, select, .cursor-pointer';

    let currentTiltTarget: HTMLElement | null = null;
    let tiltRect: DOMRect | null = null;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      // Soft, minimal ambient glow intensity (prevents excessive light spread)
      targetGlowOpacity = 0.22;
      setIsVisible(true);

      // Check for clickable hover state
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = !!target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer');
        setIsHovered(isClickable);

        // 3D Card tilt logic
        const tiltElem = target.closest(interactiveSelector) as HTMLElement | null;
        if (tiltElem) {
          if (currentTiltTarget !== tiltElem) {
            currentTiltTarget = tiltElem;
            tiltRect = tiltElem.getBoundingClientRect();
            tiltElem.style.willChange = 'transform';
            tiltElem.style.transformStyle = 'preserve-3d';
          }
          if (tiltRect) {
            const relX = e.clientX - tiltRect.left;
            const relY = e.clientY - tiltRect.top;
            const halfW = tiltRect.width / 2;
            const halfH = tiltRect.height / 2;
            targetRotX = ((relY - halfH) / halfH) * -3.5;
            targetRotY = ((relX - halfW) / halfW) * 3.5;
          }
        }
      }
    };

    const handleMouseLeave = () => {
      targetGlowOpacity = 0;
      setIsVisible(false);
      resetTilt();
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const related = e.relatedTarget as HTMLElement | null;
      const tiltElem = target?.closest(interactiveSelector) as HTMLElement | null;
      if (tiltElem && (!related || !tiltElem.contains(related))) {
        tiltElem.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        tiltElem.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        if (currentTiltTarget === tiltElem) {
          currentTiltTarget = null;
          tiltRect = null;
          targetRotX = 0;
          targetRotY = 0;
        }
      }
    };

    const resetTilt = () => {
      document.querySelectorAll(interactiveSelector).forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        htmlEl.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
      currentTiltTarget = null;
      tiltRect = null;
      targetRotX = 0;
      targetRotY = 0;
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    let animId: number;
    const updateCursor = () => {
      // Lerp glow position
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glowOpacity += (targetGlowOpacity - glowOpacity) * 0.1;

      // Lerp ring follower position
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;

      if (glowRef.current) {
        glowRef.current.style.left = `${currentX}px`;
        glowRef.current.style.top = `${currentY}px`;
        glowRef.current.style.opacity = `${glowOpacity.toFixed(3)}`;
      }

      if (dotRef.current) {
        dotRef.current.style.left = `${targetX}px`;
        dotRef.current.style.top = `${targetY}px`;
      }

      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }

      // 3D Tilt interpolation
      if (currentTiltTarget) {
        currentRotX += (targetRotX - currentRotX) * 0.1;
        currentRotY += (targetRotY - currentRotY) * 0.1;
        currentTiltTarget.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(
          2
        )}deg) rotateY(${currentRotY.toFixed(2)}deg) scale(0.992)`;
      }

      animId = requestAnimationFrame(updateCursor);
    };

    animId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animId);
      resetTilt();
    };
  }, []);

  return (
    <>
      {/* Subtle, Minimal Golden Ambient Cursor Glow (Toned down to prevent excessive light) */}
      <div
        ref={glowRef}
        id="cursor-glow"
        className="fixed pointer-events-none z-[99] -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gold/10 blur-[24px] opacity-0 transition-opacity duration-300 hidden md:block"
      />

      {/* Modern Luxury Gold Cursor Dot */}
      <div
        ref={dotRef}
        id="cursor-dot"
        className={`fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full hidden md:block transition-transform duration-75 ${
          !isVisible ? 'opacity-0' : 'opacity-100'
        } ${
          isMouseDown
            ? 'w-1.5 h-1.5 bg-[#FFF600] scale-75'
            : isHovered
            ? 'w-2 h-2 bg-[#FFDF00] scale-125'
            : 'w-2 h-2 bg-[#D4AF37]'
        } shadow-[0_0_6px_#D4AF37]`}
      />

      {/* Modern Luxury Gold Cursor Follower Ring */}
      <div
        ref={ringRef}
        id="cursor-ring"
        className={`fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full hidden md:block transition-[width,height,background-color,border-color,transform] duration-200 ease-out ${
          !isVisible ? 'opacity-0' : 'opacity-100'
        } ${
          isHovered
            ? 'w-10 h-10 border border-[#FFDF00] bg-gold/10 shadow-[0_0_10px_rgba(255,223,0,0.25)] scale-105'
            : isMouseDown
            ? 'w-6 h-6 border border-[#FFDF00] bg-gold/15 scale-90'
            : 'w-8 h-8 border border-gold/30 shadow-[0_0_6px_rgba(212,175,55,0.15)]'
        }`}
      />
    </>
  );
};
