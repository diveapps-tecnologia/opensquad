import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback, useMemo } from "react";
import { useSquadStore } from "@/store/useSquadStore";
import { AgentDesk } from "./AgentDesk";
import { HandoffEnvelope } from "./HandoffEnvelope";
import { sortAgentsByDesk, findAgent } from "@/lib/normalizeState";
import { drawFloor, drawWalls, drawRug } from "./drawRoom";
import {
  drawBookshelf, drawPlant, drawClock, drawWhiteboard,
  drawCoffeeMachine, drawFilingCabinet, drawFloorLamp,
  drawWindow, drawCouch, drawSideTable,
} from "./drawFurniture";
import { toIso } from "./isoUtils";
import { ISO_TILE_W, ISO_TILE_H, ISO_MARGIN_TILES, SCENE_SCALE } from "./palette";
import type { Graphics as PixiGraphics } from "pixi.js";

extend({ Container, Graphics });

export function OfficeScene() {
  const state = useSquadStore((s) =>
    s.selectedSquad ? s.activeStates.get(s.selectedSquad) : undefined
  );
  const squadInfo = useSquadStore((s) =>
    s.selectedSquad ? s.squads.get(s.selectedSquad) : undefined
  );

  const agents = useMemo(
    () => (state?.agents ? sortAgentsByDesk(state.agents) : []),
    [state]
  );

  // --- Iso grid dimensions ---
  const maxCol = agents.length > 0 ? Math.max(...agents.map(a => a.desk.col)) : 1;
  const maxRow = agents.length > 0 ? Math.max(...agents.map(a => a.desk.row)) : 1;

  const gridCols = maxCol + 1;
  const gridRows = maxRow + 1;
  const totalCols = gridCols + ISO_MARGIN_TILES * 2;
  const totalRows = gridRows + ISO_MARGIN_TILES * 2;

  // --- Stage size and origin ---
  const floorW = (totalCols + totalRows) * ISO_TILE_W / 2;
  const floorH = (totalCols + totalRows) * ISO_TILE_H / 2 + 80;
  const stageW = Math.max(floorW + 60, 500);
  const stageH = Math.max(floorH + 100, 400);
  const originX = stageW / 2;
  const originY = 80;

  // --- Depth-sorted agents (back to front by col+row) ---
  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => (a.desk.col + a.desk.row) - (b.desk.col + b.desk.row));
  }, [agents]);

  const drawBackground = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      // Dark void background
      g.rect(0, 0, stageW, stageH);
      g.fill({ color: 0x101018 });

      // Floor tiles
      drawFloor(g, totalCols, totalRows, originX, originY);

      // Walls (back + left edges)
      drawWalls(g, totalCols, totalRows, originX, originY);

      // Rug in the center
      drawRug(g, totalCols / 2, totalRows / 2, originX, originY);

      // --- Wall decorations (along back wall, row ~0) ---
      // Bookshelf near left end of back wall
      const bsPos = toIso(2, 0, originX, originY);
      drawBookshelf(g, bsPos.x, bsPos.y - 60);

      // Whiteboard at center of back wall
      const wbCol = Math.floor(totalCols / 2);
      const wbPos = toIso(wbCol, 0, originX, originY);
      drawWhiteboard(g, wbPos.x, wbPos.y - 60);

      // Clock near right end of back wall
      const clkCol = totalCols - 3;
      const clkPos = toIso(clkCol, 0, originX, originY);
      drawClock(g, clkPos.x, clkPos.y - 54);

      // Window on left wall
      const winPos = toIso(0, 2, originX, originY);
      drawWindow(g, winPos.x - 30, winPos.y - 60);

      // --- Floor furniture ---
      // Plants in corners
      const plantTL = toIso(1, 1, originX, originY);
      drawPlant(g, plantTL.x, plantTL.y);

      const plantTR = toIso(totalCols - 2, 1, originX, originY);
      drawPlant(g, plantTR.x, plantTR.y);

      const plantBL = toIso(1, totalRows - 2, originX, originY);
      drawPlant(g, plantBL.x, plantBL.y);

      const plantBR = toIso(totalCols - 2, totalRows - 2, originX, originY);
      drawPlant(g, plantBR.x, plantBR.y);

      // Floor lamp on left side
      const lampPos = toIso(1, Math.floor(totalRows / 2), originX, originY);
      drawFloorLamp(g, lampPos.x, lampPos.y);

      // Coffee machine on right side
      const coffeePos = toIso(totalCols - 2, Math.floor(totalRows / 2), originX, originY);
      drawCoffeeMachine(g, coffeePos.x, coffeePos.y);

      // Filing cabinet on right side lower
      const cabinetPos = toIso(totalCols - 2, Math.floor(totalRows / 2) + 2, originX, originY);
      drawFilingCabinet(g, cabinetPos.x, cabinetPos.y);

      // Couch + side table in bottom-left area (if room is big enough)
      if (totalRows > 5 && totalCols > 5) {
        const couchPos = toIso(2, totalRows - 2, originX, originY);
        drawCouch(g, couchPos.x, couchPos.y);

        const stPos = toIso(3, totalRows - 2, originX, originY);
        drawSideTable(g, stPos.x, stPos.y);
      }
    },
    [stageW, stageH, totalCols, totalRows, originX, originY]
  );

  if (!state) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {squadInfo ? (
          <>
            <span style={{ fontSize: 40 }}>{squadInfo.icon}</span>
            <span style={{ fontSize: 16 }}>{squadInfo.name}</span>
            <span style={{ fontSize: 12 }}>{squadInfo.description}</span>
            <span style={{ fontSize: 11, marginTop: 8 }}>Not running</span>
          </>
        ) : (
          <span>Select a squad to monitor</span>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <Application width={stageW * SCENE_SCALE} height={stageH * SCENE_SCALE} backgroundColor={0x101018}>
        <pixiContainer scale={SCENE_SCALE}>
          <pixiGraphics draw={drawBackground} />
          {sortedAgents.map((agent, i) => {
            const agentIndex = agents.indexOf(agent);
            return (
              <AgentDesk
                key={agent.id}
                agent={agent}
                agentIndex={agentIndex >= 0 ? agentIndex : i}
                originX={originX}
                originY={originY}
                totalCols={totalCols}
                totalRows={totalRows}
              />
            );
          })}
          {state.handoff &&
            (() => {
              const from = findAgent(state, state.handoff!.from);
              const to = findAgent(state, state.handoff!.to);
              if (!from || !to) return null;
              return (
                <HandoffEnvelope
                  handoff={state.handoff!}
                  fromAgent={from}
                  toAgent={to}
                  originX={originX}
                  originY={originY}
                />
              );
            })()}
        </pixiContainer>
      </Application>
    </div>
  );
}
