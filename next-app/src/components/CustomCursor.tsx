'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const follower = followerRef.current;
    if (!dot || !follower) return;

    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;

    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;

      if (!dot.classList.contains('is-active')) {
        dot.classList.add('is-active');
        follower.classList.add('is-active');
      }

      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, input, textarea, .three-container, h1, h2, h3, p, .bash-logo');
      if (isInteractive) {
        follower.classList.add('is-hovering');
      } else {
        follower.classList.remove('is-hovering');
      }
    };

    const onPointerLeave = () => {
      dot.classList.remove('is-active');
      follower.classList.remove('is-active');
    };

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerleave', onPointerLeave);

    let animationId: number;
    const render = () => {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;

      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      follower.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef}></div>
      <div className="cursor-follower" ref={followerRef}></div>
    </>
  );
}
