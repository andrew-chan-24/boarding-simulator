import React, { useRef, useEffect, useCallback } from 'react';
import { COLOURS, PASSENGER_TYPES } from '../simulation/constants';

const CELL_W  = 28;
const CELL_H  = 22;
const AISLE_W = 22;
const PADDING = 38;
const TOP_PAD = 28;
const WALL_W  = 8;

function buildLayout(aircraft) {
  const layout     = aircraft.layout;
  const seatLabels = 'ABCDEFGHIJ'.split('');
  const cols       = [];
  let x            = PADDING;
  let labelIdx     = 0;

  layout.forEach((count, sectionIdx) => {
    for (let s = 0; s < count; s++) {
      cols.push({ x, width: CELL_W, label: seatLabels[labelIdx++], isAisle: false });
      x += CELL_W;
    }
    if (sectionIdx < layout.length - 1) {
      cols.push({ x, width: AISLE_W, label: '', isAisle: true });
      x += AISLE_W;
    }
  });

  return { cols, totalW: x + WALL_W + 10 };
}

// Resolve cell colour — uses passenger type colour when available,
// falls back to state-based colour for stowing/waiting states
function cellColour(type, isAisle, passengerColour) {
  if (type === 'empty') return COLOURS.EMPTY;
  if (type === 'aisle') return COLOURS.AISLE;

  // Stowing and waiting always use their state colours
  // so the user can still see who is blocked/stowing
  if (type === 'stowing') return COLOURS.STOWING;
  if (type === 'waiting') return COLOURS.WAITING;

  // Walking or seated — use passenger type colour
  return passengerColour || COLOURS.SEATED;
}

function drawCabin(ctx, snapshot, aircraft, cols, canvasW, canvasH) {
  const numRows = aircraft.rows;

  ctx.fillStyle = COLOURS.BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Aisle background strips
  cols.forEach(({ x, width, isAisle }) => {
    if (!isAisle) return;
    ctx.fillStyle = '#1E2430';
    ctx.fillRect(x, TOP_PAD - 4, width, numRows * CELL_H + 8);
    ctx.strokeStyle = '#3A4255';
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x + width / 2, TOP_PAD);
    ctx.lineTo(x + width / 2, TOP_PAD + numRows * CELL_H);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Fuselage walls
  ctx.fillStyle = COLOURS.WALL;
  ctx.fillRect(PADDING - WALL_W, TOP_PAD - 4, WALL_W, numRows * CELL_H + 8);
  ctx.fillRect(
    cols[cols.length - 1].x + cols[cols.length - 1].width,
    TOP_PAD - 4, WALL_W, numRows * CELL_H + 8
  );

  // Seat labels
  ctx.fillStyle = '#88C0D0';
  ctx.font      = 'bold 10px monospace';
  ctx.textAlign = 'center';
  cols.forEach(({ x, width, label }) => {
    if (label) ctx.fillText(label, x + width / 2, TOP_PAD - 8);
  });

  // Row numbers
  ctx.fillStyle = '#6B7A8D';
  ctx.font      = '9px monospace';
  ctx.textAlign = 'right';
  for (let r = 0; r < numRows; r++) {
    const y = TOP_PAD + r * CELL_H + CELL_H / 2 + 3;
    ctx.fillText(r + 1, PADDING - WALL_W - 3, y);
  }

  // Row separator lines
  ctx.strokeStyle = '#3A4255';
  ctx.lineWidth   = 0.3;
  for (let r = 1; r < numRows; r++) {
    const y = TOP_PAD + r * CELL_H;
    ctx.beginPath();
    ctx.moveTo(PADDING - WALL_W, y);
    ctx.lineTo(cols[cols.length - 1].x + cols[cols.length - 1].width + WALL_W, y);
    ctx.stroke();
  }

  // Cells
  for (const { row, col, type, isAisle, colour } of snapshot) {
    const colDef = cols[col];
    if (!colDef) continue;

    const x = colDef.x;
    const y = TOP_PAD + row * CELL_H;
    const w = colDef.width;
    const h = CELL_H;

    if (isAisle && type === 'aisle') continue;

    const fillColour = cellColour(type, isAisle, colour);

    if (isAisle) {
      // Aisle passenger — draw as oval
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.fillStyle = fillColour;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1E2430';
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Draw passenger type icon as small text
      if (type !== 'aisle') {
        const pt = PASSENGER_TYPES[snapshot.find(
          c => c.row === row && c.col === col
        )?.passengerType];
        if (pt) {
          ctx.font      = `${Math.min(w, h) - 6}px serif`;
          ctx.textAlign = 'center';
          ctx.fillText(pt.icon, cx, cy + 4);
        }
      }
    } else {
      // Seat cell — rounded rectangle
      ctx.fillStyle = fillColour;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 3);
      ctx.fill();
      ctx.strokeStyle = type === 'empty' ? '#3A4255' : '#1E2430';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }
  }
}

export default function CabinCanvas({ sim, progress, aircraft }) {
  const canvasRef = useRef(null);

  const { cols, totalW } = aircraft
    ? buildLayout(aircraft)
    : { cols: [], totalW: 300 };

  const canvasH = TOP_PAD + (aircraft?.rows ?? 20) * CELL_H + 10;

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sim.current || !aircraft) return;
    const ctx      = canvas.getContext('2d');
    const snapshot = sim.current.getSnapshot();
    drawCabin(ctx, snapshot, aircraft, cols, totalW, canvasH);
  }, [sim, aircraft, cols, totalW, canvasH]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!sim.current) {
      ctx.fillStyle = COLOURS.BG;
      ctx.fillRect(0, 0, totalW, canvasH);
      return;
    }
    renderFrame();
  }, [progress, sim, renderFrame, totalW, canvasH]);

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={totalW}
        height={canvasH}
        style={{
          borderRadius : '8px',
          border       : `1px solid ${COLOURS.BORDER}`,
          display      : 'block',
          margin       : '0 auto',
        }}
      />
    </div>
  );
}