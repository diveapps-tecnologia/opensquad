import { extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS, ISO_MARGIN_TILES } from "./palette";
import { toIso } from "./isoUtils";
import type { Agent, Handoff } from "@/types/state";

extend({ Container, Graphics });

interface HandoffEnvelopeProps {
  handoff: Handoff;
  fromAgent: Agent;
  toAgent: Agent;
  originX: number;
  originY: number;
}

export function HandoffEnvelope({ handoff, fromAgent, toAgent, originX, originY }: HandoffEnvelopeProps) {
  const [pos, setPos] = useState<{ x: number; y: number; scale: number; rotation: number } | null>(null);
  const animatingRef = useRef(false);
  const lastHandoffRef = useRef<string | null>(null);

  // Convert desk grid positions to iso screen coords
  const fromIso = toIso(fromAgent.desk.col - 1 + ISO_MARGIN_TILES, fromAgent.desk.row - 1 + ISO_MARGIN_TILES, originX, originY);
  const toIsoPos = toIso(toAgent.desk.col - 1 + ISO_MARGIN_TILES, toAgent.desk.row - 1 + ISO_MARGIN_TILES, originX, originY);
  const fromX = fromIso.x;
  const fromY = fromIso.y;
  const toX = toIsoPos.x;
  const toY = toIsoPos.y;

  useEffect(() => {
    const key = `${handoff.from}-${handoff.to}-${handoff.completedAt}`;
    if (lastHandoffRef.current === key || animatingRef.current) return;
    lastHandoffRef.current = key;
    animatingRef.current = true;

    const duration = 1200;
    const start = performance.now();
    let frameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    function easeOutBounce(t: number): number {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }

    function animate(now: number) {
      const rawT = Math.min((now - start) / duration, 1);
      const t = easeOutBounce(rawT);

      const arcHeight = -40;
      const linearY = fromY + (toY - fromY) * t;
      const arc = arcHeight * Math.sin(rawT * Math.PI);
      const wobble = Math.sin(rawT * Math.PI * 4) * 0.15;
      const scale = rawT < 0.1 ? rawT * 10 : 1;

      setPos({
        x: fromX + (toX - fromX) * t,
        y: linearY + arc,
        scale,
        rotation: wobble,
      });

      if (rawT < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        timeoutId = setTimeout(() => {
          animatingRef.current = false;
          setPos(null);
        }, 300);
      }
    }

    setPos({ x: fromX, y: fromY, scale: 0.5, rotation: 0 });
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [handoff, fromX, fromY, toX, toY]);

  const drawEnvelope = useCallback((g: PixiGraphics) => {
    g.clear();
    g.ellipse(0, 14, 14, 4);
    g.fill({ color: 0x000000, alpha: 0.2 });
    g.rect(-14, -8, 28, 18);
    g.fill({ color: COLORS.envelopeBody });
    g.stroke({ color: COLORS.envelopeFold, width: 1 });
    g.moveTo(-14, -8);
    g.lineTo(0, 2);
    g.lineTo(14, -8);
    g.fill({ color: COLORS.envelopeFold });
    g.stroke({ color: COLORS.envelopeSeal, width: 0.5 });
    g.circle(0, 0, 4);
    g.fill({ color: COLORS.envelopeSeal });
    g.circle(0, 0, 2);
    g.fill({ color: 0xff5555 });
  }, []);

  if (!pos) return null;

  return (
    <pixiContainer x={pos.x} y={pos.y} scale={pos.scale} rotation={pos.rotation}>
      <pixiGraphics draw={drawEnvelope} />
    </pixiContainer>
  );
}
