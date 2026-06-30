import { buildSeatMeta } from './constants';

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function allSeats(aircraft) {
  const total = aircraft.layout.reduce((a, b) => a + b, 0);
  const seats = [];
  for (let r = 0; r < aircraft.rows; r++)
    for (let s = 0; s < total; s++)
      seats.push({ row: r, seat: s });
  return seats;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────
//  RANDOM
// ─────────────────────────────────────────────
export function orderRandom(aircraft) {
  return shuffle(allSeats(aircraft));
}

// ─────────────────────────────────────────────
//  BACK TO FRONT
// ─────────────────────────────────────────────
export function orderBackToFront(aircraft, numZones = 4) {
  const zoneSize = Math.ceil(aircraft.rows / numZones);
  const ordered  = [];
  for (let z = numZones - 1; z >= 0; z--) {
    const zone = allSeats(aircraft).filter(
      ({ row }) => row >= z * zoneSize && row < (z + 1) * zoneSize
    );
    shuffle(zone);
    ordered.push(...zone);
  }
  return ordered;
}

// ─────────────────────────────────────────────
//  FRONT TO BACK
// ─────────────────────────────────────────────
export function orderFrontToBack(aircraft, numZones = 4) {
  const zoneSize = Math.ceil(aircraft.rows / numZones);
  const ordered  = [];
  for (let z = 0; z < numZones; z++) {
    const zone = allSeats(aircraft).filter(
      ({ row }) => row >= z * zoneSize && row < (z + 1) * zoneSize
    );
    shuffle(zone);
    ordered.push(...zone);
  }
  return ordered;
}

// ─────────────────────────────────────────────
//  WILMA  (Window → Middle → Aisle)
// ─────────────────────────────────────────────
export function orderWILMA(aircraft) {
  const meta    = buildSeatMeta(aircraft);
  const windows = shuffle(allSeats(aircraft).filter(({ seat }) => meta[seat]?.type === 'window'));
  const middles = shuffle(allSeats(aircraft).filter(({ seat }) => meta[seat]?.type === 'middle'));
  const aisles  = shuffle(allSeats(aircraft).filter(({ seat }) => meta[seat]?.type === 'aisle'));
  return [...windows, ...middles, ...aisles];
}

// ─────────────────────────────────────────────
//  STEFFEN  (Perfect Steffen method)
// ─────────────────────────────────────────────
export function orderSteffen(aircraft) {
  const meta     = buildSeatMeta(aircraft);
  const numSeats = aircraft.layout.reduce((a, b) => a + b, 0);
  const ordered  = [];

  const byType = { window: [], middle: [], aisle: [] };
  for (let s = 0; s < numSeats; s++) {
    const t = meta[s]?.type;
    if (t) byType[t].push(s);
  }

  for (const type of ['window', 'middle', 'aisle']) {
    const seatCols  = byType[type];
    const mid       = Math.ceil(seatCols.length / 2);
    const leftCols  = seatCols.slice(0, mid);
    const rightCols = seatCols.slice(mid);

    for (const parity of [0, 1]) {
      for (const cols of [leftCols, rightCols]) {
        for (let r = aircraft.rows - 1; r >= 0; r--) {
          if (r % 2 !== parity) continue;
          for (const s of cols) {
            ordered.push({ row: r, seat: s });
          }
        }
      }
    }
  }

  return ordered;
}

// ─────────────────────────────────────────────
//  ANDREW'S METHOD
//  Board in strict ascending order of seat number.
//  Seat number = (row * seatsPerRow) + seatIndex
//  So: 1A, 1B, 1C ... 1F, 2A, 2B ... last row last seat.
//  This is essentially front-to-back, filling every seat
//  in a row completely before moving to the next row.
// ─────────────────────────────────────────────
export function orderAndrews(aircraft) {
  const total   = aircraft.layout.reduce((a, b) => a + b, 0);
  const ordered = [];
  for (let r = 0; r < aircraft.rows; r++) {
    for (let s = 0; s < total; s++) {
      ordered.push({ row: r, seat: s });
    }
  }
  return ordered;
}

// ─────────────────────────────────────────────
//  REGISTRY
// ─────────────────────────────────────────────
export const BOARDING_METHODS = {
  'Random'          : orderRandom,
  'Back-to-Front'   : orderBackToFront,
  'Front-to-Back'   : orderFrontToBack,
  'WILMA'           : orderWILMA,
  'Steffen'         : orderSteffen,
  "Andrew's Method" : orderAndrews,
};