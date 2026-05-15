'use client';

import { useEffect, useRef, useState } from 'react';
import HeroCanvas from './HeroCanvas';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * t;
}

function easeInOut(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getSectionProgress(value: number, start: number, end: number) {
  return clamp((value - start) / (end - start), 0, 1);
}

export default function ScrollScene() {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const heroStageRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const wallpaperViewRef = useRef<HTMLElement>(null);

  const [state] = useState({
    px: 0,
    py: 0,
    tx: 0,
    ty: 0,
    p: 0,
    tp: 0,
  });

  useEffect(() => {
    const scrollTrack = scrollTrackRef.current;
    const scene = sceneRef.current;
    const heroStage = heroStageRef.current;
    const heroImage = heroImageRef.current;
    const wallpaperView = wallpaperViewRef.current;

    if (!scrollTrack || !scene || !heroStage || !heroImage || !wallpaperView) return;

    const updateScrollProgress = () => {
      const rect = scrollTrack.getBoundingClientRect();
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, maxScroll);
      state.tp = maxScroll > 0 ? scrolled / maxScroll : 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      state.tx = (x - 0.5) * 2;
      state.ty = (y - 0.5) * 2;
    };

    const resetPointer = () => {
      state.tx = 0;
      state.ty = 0;
    };

    window.addEventListener('resize', updateScrollProgress);
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('pointermove', onPointerMove);
    scene.addEventListener('pointerleave', resetPointer);
    scene.addEventListener('pointercancel', resetPointer);

    let animationId: number;
    const render = () => {
      state.px += (state.tx - state.px) * 0.09;
      state.py += (state.ty - state.py) * 0.09;
      state.p += (state.tp - state.p) * 0.08;

      const pointerDepth = 1 - state.p * 0.45;
      const tiltX = state.py * 7 * pointerDepth;
      const tiltY = state.px * -10 * pointerDepth;
      const driftX = state.px * -26 * pointerDepth;
      const driftY = state.py * -22 * pointerDepth;

      const shards = document.querySelectorAll('.shard');
      shards.forEach((shard, i) => {
        const factor = (i + 1) * 15;
        (shard as HTMLElement).style.transform = `translate3d(${state.px * factor}px, ${state.py * factor}px, 0)`;
      });

      const zoomProgress = easeInOut(getSectionProgress(state.p, 0.12, 0.72));
      const heroScale = map(zoomProgress, 0, 1, 1.02, 2.9);
      const heroShiftX = map(zoomProgress, 0, 1, 0, -36);
      const heroShiftY = map(zoomProgress, 0, 1, 0, -278);

      const revealProgress = easeInOut(getSectionProgress(state.p, 0.62, 0.98));

      heroStage.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      heroImage.style.transform = `translateX(${driftX + heroShiftX}px) translateY(${driftY + heroShiftY}px) scale(${heroScale})`;
      heroImage.style.opacity = String(1 - revealProgress * 0.94);

      wallpaperView.style.opacity = String(revealProgress);
      wallpaperView.style.transform = `scale(${map(revealProgress, 0, 1, 1.18, 1)})`;
      wallpaperView.style.pointerEvents = revealProgress > 0.8 ? 'auto' : 'none';

      animationId = requestAnimationFrame(render);
    };
    render();

    updateScrollProgress();

    return () => {
      window.removeEventListener('resize', updateScrollProgress);
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('pointermove', onPointerMove);
      scene.removeEventListener('pointerleave', resetPointer);
      scene.removeEventListener('pointercancel', resetPointer);
      cancelAnimationFrame(animationId);
    };
  }, [state]);

  return (
    <div className="scroll-track" ref={scrollTrackRef}>
      <main className="scene" ref={sceneRef} aria-label="Interactive workstation scene">
        <div className="depth-layer"></div>

        <section className="hero-stage" ref={heroStageRef}>
          <HeroCanvas />
          <div className="hero-shards">
            <div className="shard s1"></div>
            <div className="shard s2"></div>
            <div className="shard s3"></div>
          </div>
          <div className="hero-image" ref={heroImageRef}></div>
          <div className="vignette"></div>
          <div className="screen-focus"></div>
        </section>

        <section className="wallpaper-view" ref={wallpaperViewRef} aria-label="Laptop wallpaper fullscreen">
          <div className="bash-logo" aria-label="</>Bash logo">
            <span className="bash-icon">&lt;/&gt;</span>
            <span className="bash-word">Bash</span>
          </div>
        </section>
      </main>
    </div>
  );
}
