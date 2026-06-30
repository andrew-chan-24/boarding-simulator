// ─────────────────────────────────────────────
//  AIRCRAFT CONFIGURATIONS
// ─────────────────────────────────────────────
export const AIRCRAFT = {
  'A320': {
    label       : 'Airbus A320',
    type        : 'narrow',
    rows        : 30,
    layout      : [3, 3],
    aisles      : 1,
    icon        : '✈',
    description : 'Narrow-body, single aisle. 180 seats.',
  },
  'A321': {
    label       : 'Airbus A321',
    type        : 'narrow',
    rows        : 35,
    layout      : [3, 3],
    aisles      : 1,
    icon        : '✈',
    description : 'Stretched narrow-body, single aisle. 210 seats.',
  },
  'B737': {
    label       : 'Boeing 737',
    type        : 'narrow',
    rows        : 32,
    layout      : [3, 3],
    aisles      : 1,
    icon        : '✈',
    description : 'Narrow-body, single aisle. 192 seats.',
  },
  'A350': {
    label       : 'Airbus A350',
    type        : 'wide',
    rows        : 40,
    layout      : [3, 3, 3],
    aisles      : 2,
    icon        : '✈✈',
    description : 'Wide-body, twin aisle. 360 seats.',
  },
  'B777': {
    label       : 'Boeing 777',
    type        : 'wide',
    rows        : 42,
    layout      : [3, 4, 3],
    aisles      : 2,
    icon        : '✈✈',
    description : 'Wide-body, twin aisle. 420 seats.',
  },
  'B747': {
    label       : 'Boeing 747',
    type        : 'wide',
    rows        : 45,
    layout      : [3, 4, 3],
    aisles      : 2,
    icon        : '✈✈',
    description : 'Wide-body, twin aisle. 405 seats.',
  },
};

export const DEFAULT_AIRCRAFT = 'A321';

// ─────────────────────────────────────────────
//  PASSENGER TYPES
//  luggage: base stow time in steps
//  speed:   walk speed multiplier (future use)
//  colour:  how they appear when seated/walking
// ─────────────────────────────────────────────
export const PASSENGER_TYPES = {
  male: {
    label      : 'Male',
    icon       : '🧑',
    luggage    : 3,       // steps to stow
    walkSpeed  : 1,
    colour     : '#5E81AC',   // blue
    seatedColour: '#4C7099',
  },
  female: {
    label      : 'Female',
    icon       : '👩',
    luggage    : 4,       // slightly longer — handbag + overhead
    walkSpeed  : 1,
    colour     : '#B48EAD',   // purple
    seatedColour: '#9A7599',
  },
  elderly: {
    label      : 'Elderly',
    icon       : '🧓',
    luggage    : 6,       // slowest — needs more time
    walkSpeed  : 0.7,
    colour     : '#D08770',   // orange
    seatedColour: '#B5705A',
  },
  child: {
    label      : 'Child',
    icon       : '🧒',
    luggage    : 2,       // fastest — small bag or no bag
    walkSpeed  : 1.2,
    colour     : '#A3BE8C',   // green
    seatedColour: '#8AA876',
  },
};

// Default composition as percentages (must sum to 100)
export const DEFAULT_COMPOSITION = {
  male    : 40,
  female  : 40,
  elderly : 10,
  child   : 10,
};

// ─────────────────────────────────────────────
//  DERIVED HELPERS
// ─────────────────────────────────────────────
export function seatsPerRow(aircraft) {
  return aircraft.layout.reduce((a, b) => a + b, 0);
}

export function totalPax(aircraft) {
  return aircraft.rows * seatsPerRow(aircraft);
}

/**
 * Assign a passenger type to each seat based on composition percentages.
 * Returns a flat array of type strings, one per seat in boarding order.
 */
export function assignPassengerTypes(totalSeats, composition) {
  const types  = [];
  const keys   = Object.keys(composition);
  const counts = {};
  let assigned = 0;

  // Calculate exact counts from percentages
  keys.forEach((k, i) => {
    if (i < keys.length - 1) {
      counts[k] = Math.round((composition[k] / 100) * totalSeats);
      assigned += counts[k];
    } else {
      // Last type gets remainder to ensure total is exact
      counts[k] = totalSeats - assigned;
    }
  });

  // Build array
  keys.forEach(k => {
    for (let i = 0; i < counts[k]; i++) types.push(k);
  });

  // Fisher-Yates shuffle so types are randomly distributed
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  return types;
}

/**
 * Build a seat-index → { section, seatInSection, type } map.
 * type: 'window' | 'middle' | 'aisle'
 */
export function buildSeatMeta(aircraft) {
  const meta   = [];
  const layout = aircraft.layout;

  const allCols = [];
  layout.forEach((count, sectionIdx) => {
    const isOuter = sectionIdx === 0 || sectionIdx === layout.length - 1;
    for (let i = 0; i < count; i++) {
      allCols.push({ sectionIdx, i, count, isOuter });
    }
  });

  const totalSeats = allCols.length;

  allCols.forEach(({ sectionIdx, i, count }, globalIdx) => {
    let type;

    if (globalIdx === 0 || globalIdx === totalSeats - 1) {
      type = 'window';
    } else if (aircraft.aisles === 1) {
      if (globalIdx === count - 1 || globalIdx === count) {
        type = 'aisle';
      } else {
        type = 'middle';
      }
    } else {
      const sectionStarts = [];
      const sectionEnds   = [];
      let offset = 0;
      layout.forEach((c) => {
        sectionStarts.push(offset);
        sectionEnds.push(offset + c - 1);
        offset += c;
      });
      const isAtAisleBoundary =
        sectionEnds.slice(0, -1).includes(globalIdx) ||
        sectionStarts.slice(1).includes(globalIdx);
      type = isAtAisleBoundary ? 'aisle' : 'middle';
    }

    meta.push({ section: sectionIdx, seatInSection: i, globalIdx, type });
  });

  return meta;
}

// ─────────────────────────────────────────────
//  SIMULATION TIMING
// ─────────────────────────────────────────────
export const LUGGAGE_TIME = 3;   // fallback if no passenger type
export const WALK_SPEED   = 1;

// ─────────────────────────────────────────────
//  PASSENGER STATES
// ─────────────────────────────────────────────
export const STATE = {
  QUEUE   : 'queue',
  WALKING : 'walking',
  STOWING : 'stowing',
  WAITING : 'waiting',
  SEATED  : 'seated',
};

// ─────────────────────────────────────────────
//  COLOUR PALETTE
// ─────────────────────────────────────────────
export const COLOURS = {
  EMPTY   : '#ECEFF4',
  SEATED  : '#5E81AC',
  WALKING : '#EBCB8B',
  STOWING : '#BF616A',
  WAITING : '#D08770',
  AISLE   : '#D8DEE9',
  WALL    : '#4C566A',
  BG      : '#2E3440',
  PANEL   : '#3B4252',
  BORDER  : '#4C566A',
};

export const METHOD_COLOURS = {
  'Random'          : '#BF616A',
  'Back-to-Front'   : '#D08770',
  'Front-to-Back'   : '#EBCB8B',
  'WILMA'           : '#A3BE8C',
  'Steffen'         : '#5E81AC',
  "Andrew's Method" : '#B48EAD',
};