import React, { useRef, useEffect, useCallback } from 'react';
import {
  COLOURS,
  PASSENGER_TYPES,
  PASSENGER_TYPE_CYCLE,
} from '../simulation/constants';

// ── Layout constants (slightly larger cells for clickability) ──
const CELL_W  = 32;
const CELL_H  = 26;
const AISLE_W = 20;
const PADDING = 42;
const TOP_PAD = 32;
const WALL_W  = 8;

function buildLayout(aircraft) {
  const layout     = aircraft.layout;
  const seatLabels = 'ABCDEFGHIJ'.split('');
  const cols       = [];
  let x            = PADDING;
  let labelIdx     = 0;

  layout.forEach((count, sectionIdx) => {
    for (let s = 0; s < count; s++) {
      cols.push({
        x,
        width   : CELL_W,
        label   : seatLabels[labelIdx++],
        isAisle : false,
        seatIdx : labelIdx - 1,
      });
      x += CELL_W;
    }
    if (sectionIdx < layout.length - 1) {
      cols.push({ x, width: AISLE_W, label: '', isAisle: true });
      x += AISLE_W;
    }
  });

  return { cols, totalW: x + WALL_W + 10 };
}

function drawSeatMap(ctx, aircraft, cols, seatMap, canvasW, canvasH, hoveredCell) {
  const numRows    = aircraft.rows;
  const numSeats   = aircraft.layout.reduce((a, b) => a + b, 0);

  // Background
  ctx.fillStyle = COLOURS.BG;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Aisle strips
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

  // Walls
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
    if (label) ctx.fillText(label, x + width / 2, TOP_PAD - 10);
  });

  // Row numbers
  ctx.fillStyle = '#6B7A8D';
  ctx.font      = '9px monospace';
  ctx.textAlign = 'right';
  for (let r = 0; r < numRows; r++) {
    const y = TOP_PAD + r * CELL_H + CELL_H / 2 + 3;
    ctx.fillText(r + 1, PADDING - WALL_W - 3, y);
  }

  // Row separators
  ctx.strokeStyle = '#3A4255';
  ctx.lineWidth   = 0.3;
  for (let r = 1; r < numRows; r++) {
    const y = TOP_PAD + r * CELL_H;
    ctx.beginPath();
    ctx.moveTo(PADDING - WALL_W, y);
    ctx.lineTo(cols[cols.length - 1].x + cols[cols.length - 1].width + WALL_W, y);
    ctx.stroke();
  }

  // Seat cells
  let seatColIdx = 0;
  cols.forEach((col, colIdx) => {
    if (col.isAisle) return;

    for (let r = 0; r < numRows; r++) {
      const seatMapIdx  = r * numSeats + seatColIdx;
      const type        = seatMap[seatMapIdx] || 'male';
      const pt          = PASSENGER_TYPES[type];
      const x           = col.x;
      const y           = TOP_PAD + r * CELL_H;
      const isHovered   = hoveredCell?.row === r && hoveredCell?.colIdx === colIdx;

      // Cell background
      ctx.fillStyle = isHovered ? pt.colour + 'CC' : pt.colour + '88';
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, CELL_W - 4, CELL_H - 4, 3);
      ctx.fill();

      // Border
      ctx.strokeStyle = isHovered ? pt.colour : pt.colour + '66';
      ctx.lineWidth   = isHovered ? 1.5 : 0.8;
      ctx.stroke();

      // Emoji icon
      ctx.font      = `${CELL_H - 10}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(pt.icon, x + CELL_W / 2, y + CELL_H / 2 + 4);
    }
    seatColIdx++;
  });
}

// ── Hit test: which seat did the user click? ──
function hitTest(x, y, cols, numRows, numSeats) {
  if (y < TOP_PAD || y > TOP_PAD + numRows * CELL_H) return null;
  const row = Math.floor((y - TOP_PAD) / CELL_H);
  if (row < 0 || row >= numRows) return null;

  let seatColIdx = 0;
  for (let colIdx = 0; colIdx < cols.length; colIdx++) {
    const col = cols[colIdx];
    if (col.isAisle) continue;
    if (x >= col.x && x < col.x + col.width) {
      return { row, colIdx, seatIdx: seatColIdx, seatMapIdx: row * numSeats + seatColIdx };
    }
    seatColIdx++;
  }
  return null;
}

export default function SeatMapEditor({ aircraft, seatMap, onSeatChange }) {
  const canvasRef    = useRef(null);
  const hoveredRef   = useRef(null);

  const { cols, totalW } = buildLayout(aircraft);
  const numSeats         = aircraft.layout.reduce((a, b) => a + b, 0);
  const canvasH          = TOP_PAD + aircraft.rows * CELL_H + 10;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawSeatMap(ctx, aircraft, cols, seatMap, totalW, canvasH, hoveredRef.current);
  }, [aircraft, cols, seatMap, totalW, canvasH]);

  // Redraw when seatMap changes
  useEffect(() => { redraw(); }, [redraw]);

  // ── Mouse click — cycle passenger type ──────
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    const hit = hitTest(x, y, cols, aircraft.rows, numSeats);
    if (!hit) return;

    const current  = seatMap[hit.seatMapIdx] || 'male';
    const cycleIdx = PASSENGER_TYPE_CYCLE.indexOf(current);
    const nextType = PASSENGER_TYPE_CYCLE[(cycleIdx + 1) % PASSENGER_TYPE_CYCLE.length];
    onSeatChange(hit.seatMapIdx, nextType);
  }, [cols, aircraft.rows, numSeats, seatMap, onSeatChange]);

  // ── Mouse move — hover highlight ─────────────
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const hit = hitTest(x, y, cols, aircraft.rows, numSeats);
    hoveredRef.current = hit ? { row: hit.row, colIdx: hit.colIdx } : null;
    redraw();
  }, [cols, aircraft.rows, numSeats, redraw]);

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = null;
    redraw();
  }, [redraw]);

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={totalW}
        height={canvasH}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          borderRadius : '8px',
          border       : `1px solid ${COLOURS.BORDER}`,
          display      : 'block',
          margin       : '0 auto',
          cursor       : 'pointer',
        }}
      />
      <div style={legendStyles.row}>
        {PASSENGER_TYPE_CYCLE.map(type => {
          const pt = PASSENGER_TYPES[type];
          return (
            <div key={type} style={legendStyles.item}>
              <span style={{ ...legendStyles.dot, background: pt.colour }} />
              <span style={legendStyles.label}>
                {pt.icon} {pt.label}
              </span>
            </div>
          );
        })}
        <span style={legendStyles.hint}>Click any seat to cycle type</span>
      </div>
    </div>
  );
}

const legendStyles = {
  row : {
    display        : 'flex',
    flexWrap       : 'wrap',
    alignItems     : 'center',
    gap            : '10px',
    marginTop      : '8px',
    justifyContent : 'center',
  },
  item : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '4px',
  },
  dot : {
    width        : '10px',
    height       : '10px',
    borderRadius : '3px',
    flexShrink   : 0,
  },
  label : {
    color    : '#A0AABB',
    fontSize : '11px',
  },
  hint : {
    color     : '#4C566A',
    fontSize  : '11px',
    fontStyle : 'italic',
    marginLeft: 'auto',
  },
};