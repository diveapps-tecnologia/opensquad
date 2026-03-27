import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS } from "./palette";
import { isoBox } from "./isoUtils";

export function drawChair(g: PixiGraphics, cx: number, cy: number): void {
  g.ellipse(cx, cy + 8, 14, 6);
  g.fill({ color: COLORS.chairWheelBase });
  for (let w = 0; w < 5; w++) {
    const ang = (w * Math.PI * 2) / 5;
    g.circle(cx + Math.cos(ang) * 12, cy + 8 + Math.sin(ang) * 5, 3);
    g.fill({ color: COLORS.chairWheel });
  }
  g.rect(cx - 1, cy + 2, 2, 6);
  g.fill({ color: COLORS.chairPole });
  isoBox(g, cx, cy, 24, 12, 6, COLORS.chairSeatTop, COLORS.chairSeatLeft, COLORS.chairSeatRight);
  isoBox(g, cx - 10, cy - 4, 6, 3, 4, COLORS.chairBackTop, COLORS.chairBackLeft, COLORS.chairBackRight);
  isoBox(g, cx + 10, cy - 4, 6, 3, 4, COLORS.chairBackTop, COLORS.chairBackLeft, COLORS.chairBackRight);
  isoBox(g, cx - 6, cy - 16, 14, 7, 16, COLORS.chairBackTop, COLORS.chairBackLeft, COLORS.chairBackRight);
  g.moveTo(cx, cy - 12);
  g.lineTo(cx + 12, cy - 6);
  g.lineTo(cx, cy);
  g.lineTo(cx - 12, cy - 6);
  g.closePath();
  g.fill({ color: 0xffffff, alpha: 0.06 });
}

export function drawDesk(g: PixiGraphics, cx: number, cy: number): void {
  isoBox(g, cx, cy, 64, 32, 22, COLORS.deskTopIso, COLORS.deskLeftIso, COLORS.deskRightIso);
  for (let i = 0; i < 5; i++) {
    g.moveTo(cx - 26, cy - 20 + i * 4);
    g.lineTo(cx + 26, cy - 20 + i * 4);
    g.stroke({ color: COLORS.deskGrain, alpha: 0.3, width: 1 });
  }
  g.rect(cx + 10, cy - 14, 18, 16);
  g.fill({ color: COLORS.deskDrawer });
  g.rect(cx + 11, cy - 13, 16, 6);
  g.fill({ color: COLORS.deskDrawerFace });
  g.rect(cx + 17, cy - 12, 4, 1);
  g.fill({ color: COLORS.deskDrawerHandle });
  g.rect(cx + 11, cy - 6, 16, 6);
  g.fill({ color: COLORS.deskDrawerFace });
  g.rect(cx + 17, cy - 5, 4, 1);
  g.fill({ color: COLORS.deskDrawerHandle });
}

export function drawMonitor(g: PixiGraphics, cx: number, cy: number, status: string): void {
  const mx = cx - 14, my = cy - 50;
  g.rect(mx + 9, my + 24, 6, 6);
  g.fill({ color: COLORS.monitorStand });
  g.rect(mx + 6, my + 29, 12, 3);
  g.fill({ color: COLORS.monitorStandBase });
  g.rect(mx, my, 24, 24);
  g.fill({ color: COLORS.monitorOuter });
  g.rect(mx + 1, my + 1, 22, 21);
  g.fill({ color: COLORS.monitorBezel });
  g.rect(mx + 2, my + 2, 20, 19);
  g.fill({ color: COLORS.monitorScreen });

  if (status === "working" || status === "delivering") {
    const lines = [10, 14, 8, 12, 10];
    lines.forEach((lw, i) => {
      g.rect(mx + 4, my + 4 + i * 3.5, lw, 1.5);
      g.fill({ color: COLORS.monitorScreenOn, alpha: 0.9 - i * 0.15 });
    });
    g.ellipse(mx + 12, my + 12, 24, 18);
    g.fill({ color: COLORS.monitorScreenOn, alpha: 0.06 });
  } else if (status === "done") {
    g.rect(mx + 8, my + 10, 2, 6);
    g.fill({ color: 0x4eff6e });
    g.rect(mx + 10, my + 7, 3, 6);
    g.fill({ color: 0x4eff6e });
    g.rect(mx + 13, my + 4, 3, 6);
    g.fill({ color: 0x4eff6e });
    g.ellipse(mx + 12, my + 12, 24, 18);
    g.fill({ color: 0x4eff6e, alpha: 0.06 });
  } else {
    g.rect(mx + 4, my + 6, 14, 1);
    g.fill({ color: COLORS.monitorScreenOn, alpha: 0.15 });
    g.rect(mx + 4, my + 9, 9, 1);
    g.fill({ color: COLORS.monitorScreenOn, alpha: 0.15 });
    g.rect(mx + 4, my + 12, 16, 1);
    g.fill({ color: COLORS.monitorScreenOn, alpha: 0.15 });
  }

  g.rect(mx + 11, my, 2, 1);
  g.fill({ color: COLORS.monitorStandBase });
  g.rect(mx + 2, my + 2, 20, 3);
  g.fill({ color: 0xffffff, alpha: 0.06 });
}

export function drawKeyboardMouse(g: PixiGraphics, cx: number, cy: number): void {
  g.rect(cx - 8, cy - 16, 22, 8);
  g.fill({ color: COLORS.keyboardBody });
  for (let kr = 0; kr < 3; kr++) {
    for (let kc = 0; kc < 7; kc++) {
      g.rect(cx - 7 + kc * 3, cy - 15 + kr * 2.4, 2, 1.4);
      g.fill({ color: COLORS.keyboardKey });
    }
  }
  g.rect(cx - 3, cy - 9, 10, 1.4);
  g.fill({ color: COLORS.keyboardKey });
  g.rect(cx + 18, cy - 16, 10, 8);
  g.fill({ color: COLORS.mousePad });
  g.rect(cx + 20, cy - 15, 5, 7);
  g.fill({ color: COLORS.mouseBody });
  g.rect(cx + 20, cy - 15, 5, 1.5);
  g.fill({ color: COLORS.mouseTop });
  g.rect(cx + 22, cy - 13, 1, 1);
  g.fill({ color: COLORS.mouseWheel });
}

export function drawDeskAccessories(g: PixiGraphics, cx: number, cy: number, agentIndex: number): void {
  const leftX = cx - 26;
  const leftY = cy - 18;
  const acc1 = (agentIndex * 7 + 3) % 4;

  switch (acc1) {
    case 0:
      g.rect(leftX, leftY, 6, 8);
      g.fill({ color: 0xece4d4 });
      g.rect(leftX, leftY, 6, 1.5);
      g.fill({ color: 0xf4ece0 });
      g.rect(leftX + 5, leftY + 1, 3, 5);
      g.fill({ color: 0xece4d4 });
      g.rect(leftX + 1, leftY - 3, 1, 2);
      g.fill({ color: 0xffffff, alpha: 0.12 });
      g.rect(leftX + 3, leftY - 5, 1, 2);
      g.fill({ color: 0xffffff, alpha: 0.08 });
      break;
    case 1:
      g.rect(leftX, leftY + 1, 8, 8);
      g.fill({ color: 0xffdd48 });
      g.rect(leftX - 1, leftY, 8, 8);
      g.fill({ color: 0xff9944 });
      g.rect(leftX, leftY + 3, 5, 1);
      g.fill({ color: 0x000000, alpha: 0.06 });
      g.rect(leftX, leftY + 5, 3, 1);
      g.fill({ color: 0x000000, alpha: 0.06 });
      break;
    case 2:
      g.rect(leftX, leftY + 2, 6, 6);
      g.fill({ color: 0x8a6a44 });
      g.rect(leftX, leftY + 2, 6, 1);
      g.fill({ color: 0x9a7a54 });
      g.circle(leftX + 3, leftY - 1, 3);
      g.fill({ color: 0x4e9e4e });
      g.circle(leftX + 1, leftY + 1, 2);
      g.fill({ color: 0x3e8e3e });
      g.circle(leftX + 5, leftY, 2);
      g.fill({ color: 0x5eae5e });
      break;
    case 3:
      g.rect(leftX, leftY, 8, 7);
      g.fill({ color: 0x6a5a4a });
      g.rect(leftX + 1, leftY + 1, 6, 5);
      g.fill({ color: 0xa0c0d0 });
      break;
  }
}
