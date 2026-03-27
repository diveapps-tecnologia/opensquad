import { useCallback, useEffect, useRef, useState } from "react";
import { extend } from "@pixi/react";
import { Container, Graphics, Text, Sprite } from "pixi.js";
import type { Agent } from "@/types/state";
import type { Graphics as PixiGraphics, TextStyleOptions, Texture } from "pixi.js";
import { COLORS, CELL_W, CELL_H, ISO_MARGIN_TILES } from "./palette";
import { drawChair, drawDesk, drawMonitor, drawKeyboardMouse, drawDeskAccessories } from "./drawDesk";
import { toIso } from "./isoUtils";
import { getCharacterTextures } from "./textures";

extend({ Container, Graphics, Text, Sprite });

export { CELL_W, CELL_H };

interface AgentDeskProps {
  agent: Agent;
  agentIndex: number;
  originX: number;
  originY: number;
  totalCols: number;
  totalRows: number;
}

export function AgentDesk({ agent, agentIndex, originX, originY }: AgentDeskProps) {
  // Map agent desk grid position to iso screen coords (offset by margin)
  const isoCol = agent.desk.col - 1 + ISO_MARGIN_TILES;
  const isoRow = agent.desk.row - 1 + ISO_MARGIN_TILES;
  const isoPos = toIso(isoCol, isoRow, originX, originY);
  const x = isoPos.x - CELL_W / 2;
  const y = isoPos.y - CELL_H / 2;

  const [frame, setFrame] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (agent.status !== "working") {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % 2;
      setFrame(frameRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [agent.status]);

  const textures = getCharacterTextures(agentIndex);

  let currentTexture: Texture;
  switch (agent.status) {
    case "working":
    case "delivering":
      currentTexture = textures.working[frame % 2];
      break;
    case "done":
      currentTexture = textures.done;
      break;
    default:
      currentTexture = textures.idle;
  }

  const drawStationBack = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      // Behind character: chair, then desk, then monitor
      drawChair(g, 0, 0);
      drawDesk(g, 0, 0);
      drawMonitor(g, 0, 0, agent.status);
    },
    [agent.status]
  );

  const drawStationFront = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      // In front of character: keyboard/mouse + accessories
      drawKeyboardMouse(g, 0, 0);
      drawDeskAccessories(g, 0, 0, agentIndex);
    },
    [agentIndex]
  );

  const drawNameCard = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      // Measure approximate card width
      const cardW = 24 + 16 + agent.name.length * 7 + 12;
      const cardH = 20;
      const cardX = (CELL_W - cardW) / 2;
      const cardY = -24;

      // Shadow
      g.roundRect(cardX + 1, cardY + 2, cardW, cardH, 8);
      g.fill({ color: 0x000000, alpha: 0.3 });

      // Card background
      g.roundRect(cardX, cardY, cardW, cardH, 8);
      g.fill({ color: COLORS.nameCardBg, alpha: 0.92 });

      // Pointer triangle (PixiJS 8 — use poly() for closed shapes)
      const triX = CELL_W / 2;
      g.poly([triX - 5, cardY + cardH, triX, cardY + cardH + 5, triX + 5, cardY + cardH]);
      g.fill({ color: COLORS.nameCardBg, alpha: 0.92 });

      // Status dot
      const dotColor = agent.status === "working" ? COLORS.statusWorking
        : agent.status === "done" ? COLORS.statusDone
        : agent.status === "checkpoint" ? COLORS.statusCheckpoint
        : COLORS.statusIdle;
      const dotX = cardX + cardW - 14;
      const dotY = cardY + cardH / 2;
      // Glow (for active states)
      if (agent.status === "working" || agent.status === "done" || agent.status === "checkpoint") {
        g.circle(dotX, dotY, 5);
        g.fill({ color: dotColor, alpha: 0.25 });
      }
      g.circle(dotX, dotY, 3.5);
      g.fill({ color: dotColor });
    },
    [agent.name, agent.status]
  );

  return (
    <pixiContainer x={x} y={y}>
      {/* Layer 1: chair + monitor (behind character) */}
      <pixiGraphics draw={drawStationBack} />

      {/* Layer 2: character sprite */}
      <pixiSprite texture={currentTexture} x={40} y={58} width={48} height={48} />

      {/* Layer 3: desk surface + keyboard + accessories (in front of character) */}
      <pixiGraphics draw={drawStationFront} />

      {/* Layer 4: name card (floating above cell) */}
      <pixiGraphics draw={drawNameCard} />
      <pixiText
        text={agent.icon || "🤖"}
        style={{ fontSize: 11 } as TextStyleOptions}
        x={(CELL_W - (24 + 16 + agent.name.length * 7 + 12)) / 2 + 6}
        y={-22}
      />
      <pixiText
        text={agent.name}
        style={{
          fontSize: 11,
          fill: COLORS.nameCardText,
          fontFamily: "-apple-system, 'Segoe UI', sans-serif",
          fontWeight: "600",
        } as TextStyleOptions}
        x={(CELL_W - (24 + 16 + agent.name.length * 7 + 12)) / 2 + 24}
        y={-22}
      />
    </pixiContainer>
  );
}
