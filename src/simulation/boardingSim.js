import {
  STATE, totalPax, seatsPerRow,
  PASSENGER_TYPES, assignPassengerTypes,
} from './constants';

// ─────────────────────────────────────────────
//  PASSENGER
// ─────────────────────────────────────────────
class Passenger {
  constructor(id, targetRow, targetSeat, passengerType) {
    this.id            = id;
    this.targetRow     = targetRow;
    this.targetSeat    = targetSeat;
    this.passengerType = passengerType;   // 'male' | 'female' | 'elderly' | 'child'
    this.aislePos      = -1;
    this.aisleIdx      = 0;
    this.stowTimer     = 0;
    this.state         = STATE.QUEUE;
  }

  get luggageTime() {
    return PASSENGER_TYPES[this.passengerType]?.luggage ?? 3;
  }

  get typeColour() {
    return PASSENGER_TYPES[this.passengerType]?.colour ?? '#5E81AC';
  }

  get seatedColour() {
    return PASSENGER_TYPES[this.passengerType]?.seatedColour ?? '#4C7099';
  }
}

// ─────────────────────────────────────────────
//  STATE CLONE / RESTORE
// ─────────────────────────────────────────────
function cloneState(sim) {
  return {
    passengers  : sim.passengers.map(p => ({ ...p })),
    aisles      : sim.aisles.map(row => [...row]),
    seats       : sim.seats.map(row => [...row]),
    nextToBoard : sim.nextToBoard,
    stepCount   : sim.stepCount,
    done        : sim.done,
    seatedCount : sim.seatedCount,
  };
}

function restoreState(sim, snap) {
  snap.passengers.forEach((sp, i) => Object.assign(sim.passengers[i], sp));
  sim.aisles = snap.aisles.map(row =>
    row.map(p => p === null ? null : sim.passengers[p.id])
  );
  sim.seats = snap.seats.map(row =>
    row.map(p => p === null ? null : sim.passengers[p.id])
  );
  sim.nextToBoard = snap.nextToBoard;
  sim.stepCount   = snap.stepCount;
  sim.done        = snap.done;
  sim.seatedCount = snap.seatedCount;
}

// ─────────────────────────────────────────────
//  SIMULATION
// ─────────────────────────────────────────────
export class BoardingSim {
  constructor(boardingOrder, aircraft, composition) {
    this.aircraft  = aircraft;
    this.numRows   = aircraft.rows;
    this.numSeats  = seatsPerRow(aircraft);
    this.numAisles = aircraft.aisles;
    this.paxTotal  = totalPax(aircraft);

    // Assign a passenger type to every seat
    const typeList = assignPassengerTypes(this.paxTotal, composition);

    this.passengers = boardingOrder.map(({ row, seat }, i) => {
      const p    = new Passenger(i, row, seat, typeList[i]);
      p.aisleIdx = this._nearestAisle(seat);
      return p;
    });

    this.aisles = Array.from({ length: this.numAisles }, () =>
      new Array(this.numRows).fill(null)
    );
    this.seats = Array.from({ length: this.numRows }, () =>
      new Array(this.numSeats).fill(null)
    );

    this.nextToBoard = 0;
    this.stepCount   = 0;
    this.done        = false;
    this.seatedCount = 0;
    this.history     = [];
    this.MAX_HISTORY = 500;

    // Track type breakdown for stats
    this.typeCounts = {};
    this.passengers.forEach(p => {
      this.typeCounts[p.passengerType] =
        (this.typeCounts[p.passengerType] || 0) + 1;
    });
  }

  _nearestAisle(seatIdx) {
    if (this.numAisles === 1) return 0;
    const layout     = this.aircraft.layout;
    const leftEnd    = layout[0];
    const rightStart = layout[0] + layout[1];
    return seatIdx < (leftEnd + rightStart) / 2 ? 0 : 1;
  }

  _saveHistory() {
    this.history.push(cloneState(this));
    if (this.history.length > this.MAX_HISTORY) this.history.shift();
  }

  step() {
    if (this.done) return;
    this._saveHistory();
    this.stepCount++;

    // ── Phase 2: Admit exactly one passenger ──────────────────
    for (let i = this.nextToBoard; i < this.passengers.length; i++) {
      const p = this.passengers[i];
      if (p.state !== STATE.QUEUE) continue;
      const a = p.aisleIdx;
      if (this.aisles[a][0] !== null) break;
      p.aislePos        = 0;
      p.state           = STATE.WALKING;
      this.aisles[a][0] = p;
      this.nextToBoard  = i + 1;
      break;
    }

    // ── Phase 3: Process each aisle back → front ──────────────
    for (let a = 0; a < this.numAisles; a++) {
      for (let row = this.numRows - 1; row >= 0; row--) {
        const p = this.aisles[a][row];
        if (!p) continue;

        // Case A — stowing luggage (uses passenger-type specific time)
        if (p.state === STATE.STOWING) {
          p.stowTimer--;
          if (p.stowTimer <= 0) {
            this.seats[p.targetRow][p.targetSeat] = p;
            this.aisles[a][row] = null;
            p.state = STATE.SEATED;
            this.seatedCount++;
          }
          continue;
        }

        // Case B — reached target row
        if (row === p.targetRow) {
          p.state     = STATE.STOWING;
          p.stowTimer = p.luggageTime;   // ← type-specific luggage time
          continue;
        }

        // Case C — walk forward
        const nextRow = row + 1;
        if (nextRow < this.numRows && this.aisles[a][nextRow] === null) {
          this.aisles[a][nextRow] = p;
          this.aisles[a][row]     = null;
          p.aislePos              = nextRow;
          p.state                 = STATE.WALKING;
        } else {
          // Case D — blocked
          p.state = STATE.WAITING;
        }
      }
    }

    if (this.seatedCount === this.paxTotal) this.done = true;
  }

  stepBack() {
    if (this.history.length === 0) return false;
    restoreState(this, this.history.pop());
    return true;
  }

  get canStepBack() { return this.history.length > 0; }

  stepN(n) {
    for (let i = 0; i < n && !this.done; i++) this.step();
  }

  runToEnd() {
    while (!this.done) this.step();
    return this.stepCount;
  }

  // ── Snapshot — now includes passenger type per cell ──────────
  getSnapshot() {
    const cells  = [];
    const layout = this.aircraft.layout;

    for (let r = 0; r < this.numRows; r++) {
      let seatOffset = 0;
      let colOffset  = 0;

      layout.forEach((count, sectionIdx) => {
        for (let s = 0; s < count; s++) {
          const seated = this.seats[r][seatOffset + s];
          cells.push({
            row          : r,
            col          : colOffset + s,
            type         : seated ? 'seated' : 'empty',
            isAisle      : false,
            passengerType: seated ? seated.passengerType : null,
            colour       : seated ? seated.seatedColour  : null,
          });
        }
        colOffset  += count;
        seatOffset += count;

        if (sectionIdx < layout.length - 1) {
          const aisleP = this.aisles[sectionIdx][r];
          cells.push({
            row          : r,
            col          : colOffset,
            type         : aisleP ? aisleP.state : 'aisle',
            isAisle      : true,
            aisleIdx     : sectionIdx,
            passengerType: aisleP ? aisleP.passengerType : null,
            colour       : aisleP ? aisleP.typeColour     : null,
          });
          colOffset++;
        }
      });
    }
    return cells;
  }

  getProgress() {
    return {
      seated      : this.seatedCount,
      total       : this.paxTotal,
      pct         : Math.round((this.seatedCount / this.paxTotal) * 100),
      steps       : this.stepCount,
      done        : this.done,
      canStepBack : this.canStepBack,
      typeCounts  : { ...this.typeCounts },
    };
  }
}