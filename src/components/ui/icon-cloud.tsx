'use client';

// Magic UI Icon Cloud — registry implementation verbatim (icon-cloud.tsx), ported
// with four SHORT, MARKED additions so this portfolio can use it as its
// interactive constellation. Everything else — canvas, Fibonacci sphere, drag
// rotation, rotationRef, pause/play — is unchanged. Not recreated.
//
// Added by the host (marked EXT):
//   EXT 1  `seed?: number` — when bumped, the cloud glides to a new orientation
//          (golden-angle step) instead of re-running the layout: no icon jumps.
//   EXT 2  `dimmedIndices?: Set<number>` — icons outside the active category are
//          drawn faded/grayscaled. Sprites themselves are untouched.
//   EXT 3  `selectedIndex?: number | null` — accent glow ring drawn behind the
//          selected icon.
//   EXT 4  `onIconClick` / `onIconHover` — callbacks fired from the SAME hit-test
//          the registry already uses in handleMouseDown / handleMouseMove (5 lines).
//   EXT 5  shadcn <Button> replaced with an inline button (same aria pattern) —
//          this project has no Button component.

import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface Icon {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  id: number;
}

interface IconCloudProps {
  icons?: React.ReactNode[];
  images?: string[];
  showControl?: boolean;
  seed?: number;
  dimmedIndices?: Set<number>;
  selectedIndex?: number | null;
  hoveredIndex?: number | null;
  onIconClick?: (index: number) => void;
  onIconHover?: (index: number | null) => void;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function IconCloud({
  icons,
  images,
  showControl = true,
  seed = 0,
  dimmedIndices,
  selectedIndex = null,
  hoveredIndex = null,
  onIconClick,
  onIconHover,
}: IconCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [iconPositions, setIconPositions] = useState<Icon[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetRotation, setTargetRotation] = useState<{
    x: number;
    y: number;
    startX: number;
    startY: number;
    distance: number;
    startTime: number;
    duration: number;
  } | null>(null);
  const animationFrameRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0, y: 0 });
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const imagesLoadedRef = useRef<boolean[]>([]);
  const dimmedRef = useRef(dimmedIndices);
  const selectedRef = useRef(selectedIndex);
  const hoveredRef = useRef(hoveredIndex);
  const lastSeedRef = useRef(seed);
  dimmedRef.current = dimmedIndices;
  selectedRef.current = selectedIndex;
  hoveredRef.current = hoveredIndex;

  // Pause animation if user prefers reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPaused(true);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setIsPaused(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Off-screen / hidden-tab pause — rAF stays cheap when the cloud isn't visible
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => setAutoPaused(!entries[entries.length - 1]?.isIntersecting),
      { rootMargin: '140px 0px 140px 0px' }
    );
    io.observe(el);
    const onVisibility = () => setAutoPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const paused = isPaused || autoPaused;

  // EXT 1 — glide to the next golden-angle orientation on seed bump (shuffle / category change)
  useEffect(() => {
    if (seed === lastSeedRef.current) return;
    lastSeedRef.current = seed;
    setTargetRotation((current) => ({
      x: rotationRef.current.x,
      y: (current?.y ?? rotationRef.current.y) + Math.PI * (3 - Math.sqrt(5)) * 2,
      startX: rotationRef.current.x,
      startY: current?.y ?? rotationRef.current.y,
      distance: Math.PI * (3 - Math.sqrt(5)) * 2,
      startTime: performance.now(),
      duration: 750,
    }));
  }, [seed]);

  // Create icon canvases once when icons/images change
  useEffect(() => {
    if (!icons && !images) return;

    const items = icons ?? images ?? [];
    imagesLoadedRef.current = new Array(items.length).fill(false);

    const newIconCanvases = items.map((item, index) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = 40;
      offscreen.height = 40;
      const offCtx = offscreen.getContext('2d');

      if (offCtx) {
        if (images) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height);

            // Create circular clipping path
            offCtx.beginPath();
            offCtx.arc(20, 20, 20, 0, Math.PI * 2);
            offCtx.closePath();
            offCtx.clip();

            // Draw the image
            offCtx.drawImage(img, 0, 0, 40, 40);

            imagesLoadedRef.current[index] = true;
          };
          img.src = items[index] as string;
        } else {
          // Handle SVG icons
          offCtx.scale(0.4, 0.4);
          const svgString = renderToString(item as React.ReactElement);
          const img = new Image();
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
            offCtx.drawImage(img, 0, 0);
            imagesLoadedRef.current[index] = true;
          };
          // onload must precede src — data-URI SVGs can decode synchronously
          img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        }
      }
      return offscreen;
    });

    iconCanvasesRef.current = newIconCanvases;
  }, [icons, images]);

  // Generate initial icon positions on a sphere
  useEffect(() => {
    const items = icons ?? images ?? [];
    const newIcons: Icon[] = [];
    const numIcons = items.length || 20;

    // Fibonacci sphere parameters
    const offset = 2 / numIcons;
    const increment = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < numIcons; i++) {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * increment;

      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;

      newIcons.push({
        x: x * 195,
        y: y * 195,
        z: z * 195,
        scale: 1,
        opacity: 1,
        id: i,
      });
    }
    setIconPositions(newIcons);
  }, [icons, images]);

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!canvas || !rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on an icon
    const clickedIcon = iconPositions.find((icon) => {
      const rotatedZ =
        icon.x * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x) +
        icon.y * Math.sin(rotationRef.current.x) +
        icon.z * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x);

      const rotatedX =
        icon.x * Math.cos(rotationRef.current.y) - icon.z * Math.sin(rotationRef.current.y);
      const rotatedY =
        icon.x * Math.sin(rotationRef.current.x) * Math.sin(rotationRef.current.y) +
        icon.y * Math.cos(rotationRef.current.x) -
        icon.z * Math.sin(rotationRef.current.x) * Math.cos(rotationRef.current.y);

      const screenX = canvas.width / 2 + rotatedX;
      const screenY = canvas.height / 2 + rotatedY;

      const scale = (rotatedZ + 200) / 300;
      const radius = 20 * scale;
      const dx = x - screenX;
      const dy = y - screenY;

      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z)
        );
        const targetY = Math.atan2(icon.x, icon.z);

        const currentX = rotationRef.current.x;
        const currentY = rotationRef.current.y;
        const distance = Math.sqrt(
          Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2)
        );

        const duration = Math.min(2000, Math.max(800, distance * 1000));

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        });
        onIconClick?.(icon.id); // EXT 4
        return true;
      }
      return false;
    });

    if (!clickedIcon) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      // EXT 4 — hover hit-test (5 lines, same math as the registry's click hit-test)
      if (onIconHover && canvasRef.current) {
        const canvas = canvasRef.current;
        const hovered = iconPositions.find((icon) => {
          const rotatedZ =
            icon.x * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x) +
            icon.y * Math.sin(rotationRef.current.x) +
            icon.z * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x);
          const rotatedX =
            icon.x * Math.cos(rotationRef.current.y) - icon.z * Math.sin(rotationRef.current.y);
          const rotatedY =
            icon.x * Math.sin(rotationRef.current.x) * Math.sin(rotationRef.current.y) +
            icon.y * Math.cos(rotationRef.current.x) -
            icon.z * Math.sin(rotationRef.current.x) * Math.cos(rotationRef.current.y);
          const scale = (rotatedZ + 200) / 300;
          const radius = 20 * scale;
          const dx = x - (canvas.width / 2 + rotatedX);
          const dy = y - (canvas.height / 2 + rotatedY);
          return dx * dx + dy * dy < (radius + 2) * (radius + 2);
        });
        onIconHover(hovered ? hovered.id : null);
      }
    }

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      rotationRef.current = {
        x: rotationRef.current.x + deltaY * 0.002,
        y: rotationRef.current.y + deltaX * 0.002,
      };

      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Animation and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const dx = mousePos.x - centerX;
        const dy = mousePos.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 0.003 + (distance / maxDistance) * 0.01;

        if (targetRotation) {
          const elapsed = performance.now() - targetRotation.startTime;
          const progress = Math.min(1, elapsed / targetRotation.duration);
          const easedProgress = easeOutCubic(progress);

          rotationRef.current = {
            x:
              targetRotation.startX +
              (targetRotation.x - targetRotation.startX) * easedProgress,
            y:
              targetRotation.startY +
              (targetRotation.y - targetRotation.startY) * easedProgress,
          };

          if (progress >= 1) {
            setTargetRotation(null);
          }
        } else if (!isDragging && !paused) {
          rotationRef.current = {
            x: rotationRef.current.x + (dy / canvas.height) * speed,
            y: rotationRef.current.y + (dx / canvas.width) * speed,
          };
        }

        iconPositions.forEach((icon, index) => {
          const cosX = Math.cos(rotationRef.current.x);
          const sinX = Math.sin(rotationRef.current.x);
          const cosY = Math.cos(rotationRef.current.y);
          const sinY = Math.sin(rotationRef.current.y);

          const rotatedZ =
            icon.x * sinY * cosX + icon.y * sinX + icon.z * cosY * cosX;
          const rotatedX = icon.x * cosY - icon.z * sinY;
          const rotatedY =
            icon.x * sinX * sinY + icon.y * cosX - icon.z * sinX * cosY;

          const scale = (rotatedZ + 200) / 300;
          const opacity = Math.max(0.2, Math.min(1, (rotatedZ + 150) / 200));

          ctx.save();
          ctx.translate(
            canvas.width / 2 + rotatedX,
            canvas.height / 2 + rotatedY
          );
          ctx.scale(scale, scale);

          const dimmed = dimmedRef.current?.has(index) ?? false;
          const hovered = hoveredRef.current === index;
          const selected = selectedRef.current === index;

          if (dimmed) {
            // EXT 2 — non-matching category: fade back, best-effort grayscale
            ctx.globalAlpha = opacity * 0.22;
            try {
              ctx.filter = 'grayscale(1)';
            } catch {
              ctx.filter = 'none';
            }
          } else {
            ctx.globalAlpha = opacity;
            ctx.filter = 'none';
          }

          // EXT 3 — selected / hovered glow behind the icon
          if (selected || hovered) {
            const radius = selected ? 22 : 21;
            const gradient = ctx.createRadialGradient(0, 0, 4, 0, 0, radius + 9);
            gradient.addColorStop(0, 'rgba(244, 119, 54, 0.5)');
            gradient.addColorStop(1, 'rgba(244, 119, 54, 0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius + 9, 0, Math.PI * 2);
            ctx.fill();
            if (selected) {
              ctx.globalAlpha = 1;
              ctx.strokeStyle = '#F47736';
              ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.arc(0, 0, radius, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          if (icons || images) {
            // Only try to render icons/images if they exist
            if (
              iconCanvasesRef.current[index] &&
              imagesLoadedRef.current[index]
            ) {
              ctx.drawImage(iconCanvasesRef.current[index], -20, -20, 40, 40);
            }
          } else {
            // Show numbered circles if no icons/images are provided
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fillStyle = '#4444ff';
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '16px Arial';
            ctx.fillText(`${icon.id + 1}`, 0, 0);
          }

          ctx.restore();
        });

        const hasPendingAssets =
          Boolean(icons || images) &&
          !imagesLoadedRef.current.every((loaded) => loaded);
        const shouldContinue =
          !paused || isDragging || targetRotation !== null || hasPendingAssets;

        if (shouldContinue) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    icons,
    images,
    iconPositions,
    isDragging,
    paused,
    mousePos,
    targetRotation,
  ]);

  return (
    <div className="icon-cloud" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="icon-cloud__canvas"
        aria-label="Interactive technology constellation. Drag to rotate. Use the technology list to select by keyboard."
        role="img"
      />
      {showControl && (
        <button
          type="button"
          className="icon-cloud__control"
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? 'Play constellation animation' : 'Pause constellation animation'}
          aria-pressed={isPaused}
        >
          {isPaused ? <Play size={15} /> : <Pause size={15} />}
        </button>
      )}
    </div>
  );
}
