import React, { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
  speedMultiplier?: number;
}

/**
 * 1. FluidCursorCanvas:
 * Interactive golden fluid sparkles that emit directly from mouse and touch movement
 * Exactly as implemented on omaersabbir.vercel.app (#fluid-canvas)
 */
export const FluidCursorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxSize: number;
      alpha: number;
      decay: number;
      color: string;
      glow: string;
    }> = [];
    const maxParticles = isMobile ? 18 : 36;

    const colors = [
      { color: 'rgba(212, 175, 55, ', glow: 'rgba(212, 175, 55, 0.3)' },
      { color: 'rgba(245, 158, 11, ', glow: 'rgba(245, 158, 11, 0.25)' },
      { color: 'rgba(255, 230, 120, ', glow: 'rgba(255, 230, 120, 0.35)' }
    ];

    let lastX = -1000;
    let lastY = -1000;
    let lastTime = 0;

    const spawnParticles = (x: number, y: number, count = 1, scale = 0.8) => {
      try {
        const dx = lastX === -1000 ? 0 : x - lastX;
        const dy = lastY === -1000 ? 0 : y - lastY;
        const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 30);

        for (let i = 0; i < count; i++) {
          if (particles.length >= maxParticles) {
            particles.shift();
          }
          const angle = Math.random() * Math.PI * 2;
          const force = (Math.random() * 1.2 + 0.3) * scale;
          const vx = (dx * 0.08 + Math.cos(angle) * force) * 0.5;
          const vy = (dy * 0.08 + Math.sin(angle) * force) * 0.5;
          const col = colors[Math.floor(Math.random() * colors.length)];
          // Minimal tiny micro-sparkle size (prevents overwhelming bright blobs)
          const size = Math.random() * 2.2 + 1;

          particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx,
            vy,
            size,
            maxSize: size * 1.3,
            // Low, subtle alpha so it is a delicate hint of light
            alpha: Math.min(0.28, 0.12 + (speed / 30) * 0.14),
            decay: 0.026 + Math.random() * 0.02,
            color: col.color,
            glow: col.glow
          });
        }
        lastX = x;
        lastY = y;
      } catch (e) {
        console.warn('Canvas particle error suppressed', e);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < 32) return;
      lastTime = now;
      spawnParticles(e.clientX, e.clientY, 1, 0.7);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      spawnParticles(e.touches[0].clientX, e.touches[0].clientY, 1, 0.6);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    const render = () => {
      try {
        ctx.clearRect(0, 0, width, height);
        if (particles.length > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.94;
            p.vy *= 0.94;
            p.size += (p.maxSize - p.size) * 0.06;
            p.alpha -= p.decay;

            if (p.alpha <= 0.01) {
              particles.splice(i, 1);
              continue;
            }

            const rad = Math.max(1, p.size);
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
            grad.addColorStop(0, p.color + p.alpha + ')');
            grad.addColorStop(0.5, p.color + p.alpha * 0.4 + ')');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          }
          ctx.restore();
        }
      } catch (e) {
        console.warn('Canvas render error suppressed', e);
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="fluid-canvas"
      className="fixed inset-0 w-full h-full z-[98] pointer-events-none opacity-90 transition-opacity duration-300"
    />
  );
};

/**
 * 2. OrbitParticlesCanvas:
 * Concentric orbital ring particle galaxy rotating in background
 * Repels with interactive magnetic physics when mouse cursor approaches
 * Exactly as implemented on omaersabbir.vercel.app (#hero-below-particles-canvas)
 */
export const OrbitParticlesCanvas: React.FC<{ speedMultiplier?: number }> = ({ speedMultiplier = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      isScrolling = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const ringCount = isMobile ? 7 : 18;
    const particlesPerRing = isMobile ? 5 : 10;
    const colorPalette = [
      { color: 'rgba(255, 223, 0, ', glow: 'rgba(255, 223, 0, 0.95)' },
      { color: 'rgba(249, 115, 22, ', glow: 'rgba(249, 115, 22, 0.95)' },
      { color: 'rgba(255, 255, 255, ', glow: 'rgba(255, 255, 255, 0.95)' }
    ];

    const particles: Array<{
      ringIndex: number;
      angle: number;
      radius: number;
      vx: number;
      vy: number;
      xOffset: number;
      yOffset: number;
      angularSpeed: number;
      size: number;
      color: string;
      glowColor: string;
      alpha: number;
    }> = [];

    for (let r = 0; r < ringCount; r++) {
      const radius = 140 + r * (isMobile ? 45 : 65);
      const col = colorPalette[r % 3];
      for (let p = 0; p < particlesPerRing; p++) {
        const angle = (p / particlesPerRing) * Math.PI * 2 + 0.18 * r;
        const angularSpeed = (0.002 + (r / ringCount) * 0.0015) * (r % 2 === 0 ? 1 : -1) * speedMultiplier;
        const alpha = 0.35 * Math.random() + 0.55;
        particles.push({
          ringIndex: r,
          angle,
          radius,
          vx: 0,
          vy: 0,
          xOffset: 0,
          yOffset: 0,
          angularSpeed,
          size: 4.5 * Math.random() + 3,
          color: col.color,
          glowColor: col.glow,
          alpha
        });
      }
    }

    let currentOpacity = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      if (isMobile && isScrolling) return;

      ctx.clearRect(0, 0, width, height);
      const scrollY = window.pageYOffset;
      // Smoothly display after initial hero or gentle presence
      currentOpacity += ((scrollY > 150 ? 0.85 : 0.45) - currentOpacity) * 0.08;
      canvas.style.opacity = currentOpacity.toFixed(3);

      if (currentOpacity < 0.02) return;

      const originX = -0.12 * width;
      const originY = 1.12 * height;
      const enableGlow = !isMobile;

      particles.forEach((p) => {
        p.angle += p.angularSpeed;
        const baseX = originX + Math.cos(p.angle) * p.radius;
        const baseY = originY + Math.sin(p.angle) * (0.75 * p.radius);
        const px = baseX + p.xOffset;
        const py = baseY + p.yOffset;

        // Interactive cursor repulsion within 260px
        if (mouseX !== -1000 && mouseY !== -1000) {
          const dx = px - mouseX;
          const dy = py - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 260 && dist > 0) {
            const pushAngle = Math.atan2(dy, dx);
            const force = 16 * Math.pow((260 - dist) / 260, 1.3);
            p.vx += Math.cos(pushAngle) * force;
            p.vy += Math.sin(pushAngle) * force;
          }
        }

        p.xOffset += p.vx;
        p.yOffset += p.vy;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.xOffset += (0 - p.xOffset) * 0.035;
        p.yOffset += (0 - p.yOffset) * 0.035;

        const finalX = baseX + p.xOffset;
        const finalY = baseY + p.yOffset;

        const tangent = p.angle + Math.PI / 2;
        const len = p.size;

        ctx.save();
        ctx.translate(finalX, finalY);
        ctx.rotate(tangent);
        ctx.beginPath();
        ctx.moveTo(-len / 2, 0);
        ctx.lineTo(len / 2, 0);
        ctx.strokeStyle = p.color + 0.85 * p.alpha + ')';
        ctx.lineWidth = Math.max(2, Math.min(3.5, p.radius / 120));
        ctx.lineCap = 'round';
        if (enableGlow) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.glowColor;
        }
        ctx.stroke();
        ctx.restore();
      });
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      id="hero-below-particles-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-40 transition-opacity duration-500 will-change-transform"
    />
  );
};

/**
 * Combined particle & background animation controller
 */
export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ speedMultiplier = 1 }) => {
  return (
    <>
      <OrbitParticlesCanvas speedMultiplier={speedMultiplier} />
      <FluidCursorCanvas />
    </>
  );
};
