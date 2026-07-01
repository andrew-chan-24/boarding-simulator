import React, { useState, useCallback, useMemo } from 'react';
import MethodSelector      from './MethodSelector';
import SpeedControl        from './SpeedControl';
import StatsPanel          from './StatsPanel';
import CabinCanvas         from './CabinCanvas';
import SeatMapEditor       from './SeatMapEditor';
import ComparisonChart     from './ComparisonChart';
import AircraftSelector    from './AircraftSelector';
import CompositionSelector from './CompositionSelector';
import InfoPage            from './InfoPage';
import { useSimulation }    from '../hooks/useSimulation';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import {
  AIRCRAFT,
  DEFAULT_AIRCRAFT,
  DEFAULT_COMPOSITION,
  PASSENGER_TYPES,
  COLOURS,
  METHOD_COLOURS,
  assignPassengerTypes,
  totalPax,
} from '../simulation/constants';

const TABS = [
  { key: 'info',    label: 'ℹ️ About'   },
  { key: 'animate', label: '🎬 Animate' },
  { key: 'compare', label: '📊 Compare' },
];

function getPrimaryBtn({ progress, isRunning, selected, onStart, onPause, onResume }) {
  if (!progress) {
    return {
      label    : '▶ Start',
      colour   : selected ? '#5E81AC' : '#3B4252',
      disabled : !selected,
      action   : onStart,
    };
  }
  if (progress.done) {
    return { label: '✅ Complete', colour: '#4C566A', disabled: true, action: () => {} };
  }
  if (isRunning) {
    return { label: '⏸ Pause', colour: '#D08770', disabled: false, action: onPause };
  }
  return { label: '▶ Resume', colour: '#A3BE8C', disabled: false, action: onResume };
}

// ─────────────────────────────────────────────
//  COLOUR LEGEND
// ─────────────────────────────────────────────
function ColourLegend({ paxMode }) {
  const stateItems = [
    { colour: COLOURS.STOWING, label: 'Stowing'  },
    { colour: COLOURS.WAITING, label: 'Blocked'  },
    { colour: COLOURS.EMPTY,   label: 'Empty'    },
    { colour: '#1E2430',       label: 'Aisle'    },
  ];

  return (
    <div style={legendStyles.container}>

      {/* Passenger type colours */}
      <div style={legendStyles.group}>
        <span style={legendStyles.groupLabel}>Passenger Types</span>
        <div style={legendStyles.items}>
          {Object.entries(PASSENGER_TYPES).map(([key, pt]) => (
            <div key={key} style={legendStyles.item}>
              <span style={{ ...legendStyles.dot, background: pt.colour }} />
              <span style={legendStyles.label}>{pt.icon} {pt.label}</span>
              <span style={legendStyles.sub}>{pt.luggage}s stow</span>
            </div>
          ))}
        </div>
      </div>

      <div style={legendStyles.divider} />

      {/* State colours */}
      <div style={legendStyles.group}>
        <span style={legendStyles.groupLabel}>States</span>
        <div style={legendStyles.items}>
          {stateItems.map(({ colour, label }) => (
            <div key={label} style={legendStyles.item}>
              <span style={{ ...legendStyles.dot, background: colour }} />
              <span style={legendStyles.label}>{label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const legendStyles = {
  container : {
    background   : '#3B4252',
    borderRadius : '8px',
    border       : '1px solid #4C566A',
    padding      : '10px 14px',
    marginBottom : '10px',
    display      : 'flex',
    gap          : '16px',
    flexWrap     : 'wrap',
    alignItems   : 'flex-start',
  },
  group : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '6px',
    flex          : 1,
    minWidth      : '140px',
  },
  groupLabel : {
    color         : '#6B7A8D',
    fontSize      : '10px',
    fontWeight    : '600',
    textTransform : 'uppercase',
    letterSpacing : '0.06em',
  },
  items : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '4px',
  },
  item : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '6px',
  },
  dot : {
    width        : '10px',
    height       : '10px',
    borderRadius : '3px',
    flexShrink   : 0,
    border       : '1px solid #4C566A44',
  },
  label : {
    color    : '#D8DEE9',
    fontSize : '11px',
    flex     : 1,
  },
  sub : {
    color    : '#6B7A8D',
    fontSize : '10px',
  },
  divider : {
    width      : '1px',
    background : '#4C566A',
    alignSelf  : 'stretch',
  },
};

// ─────────────────────────────────────────────
//  RESULTS PANEL
// ─────────────────────────────────────────────
function ResultsPanel({ progress, methodName, aircraftLabel, isRunning, seatMap, paxMode }) {
  if (!progress) {
    return (
      <div style={resultsStyles.empty}>
        <div style={resultsStyles.emptyIcon}>📊</div>
        <div style={resultsStyles.emptyTitle}>No results yet</div>
        <div style={resultsStyles.emptyText}>
          Configure your settings on the left and press Start to begin the simulation.
        </div>
      </div>
    );
  }

  const { seated, total, pct, steps, done, typeCounts } = progress;
  const colour = METHOD_COLOURS[methodName] || '#5E81AC';

  return (
    <div style={resultsStyles.container}>

      {/* Aircraft + method */}
      {aircraftLabel && (
        <div style={resultsStyles.meta}>
          <span style={resultsStyles.metaIcon}>🛫</span>
          <span style={resultsStyles.metaText}>{aircraftLabel}</span>
        </div>
      )}
      {methodName && (
        <div style={resultsStyles.meta}>
          <span style={{ ...resultsStyles.methodDot, background: colour }} />
          <span style={{ ...resultsStyles.metaText, color: colour }}>{methodName}</span>
        </div>
      )}

      {/* Progress bar */}
      <div style={resultsStyles.barTrack}>
        <div style={{
          ...resultsStyles.barFill,
          width      : `${pct}%`,
          background : colour,
          boxShadow  : `0 0 8px ${colour}88`,
        }} />
        <span style={resultsStyles.barLabel}>{pct}%</span>
      </div>

      {/* Stat boxes */}
      <div style={resultsStyles.statGrid}>
        {[
          { label: 'Seated',  value: `${seated}/${total}`, colour },
          { label: 'Steps',   value: steps,                colour },
          { label: 'Status',  value: done ? '✅ Done' : isRunning ? '▶ Running' : '⏸ Paused' },
        ].map(({ label, value, colour: c }) => (
          <div key={label} style={{ ...resultsStyles.statBox, borderColor: c || '#4C566A' }}>
            <div style={{ ...resultsStyles.statValue, color: c || '#ECEFF4' }}>{value}</div>
            <div style={resultsStyles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Passenger type breakdown */}
      {typeCounts && (
        <div style={resultsStyles.breakdown}>
          <div style={resultsStyles.breakdownTitle}>Passenger Composition</div>
          {Object.entries(PASSENGER_TYPES).map(([key, pt]) => {
            const count = typeCounts[key] || 0;
            const p     = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} style={resultsStyles.typeRow}>
                <span style={resultsStyles.typeIcon}>{pt.icon}</span>
                <span style={{ ...resultsStyles.typeName, color: pt.colour }}>
                  {pt.label}
                </span>
                <div style={resultsStyles.typeBarTrack}>
                  <div style={{
                    ...resultsStyles.typeBarFill,
                    width      : `${p}%`,
                    background : pt.colour,
                  }} />
                </div>
                <span style={resultsStyles.typeCount}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion message */}
      {done && (
        <div style={resultsStyles.doneBox}>
          <div style={resultsStyles.doneTitle}>🏁 Boarding Complete</div>
          <div style={resultsStyles.doneStat}>
            <span style={resultsStyles.doneLabel}>Total steps</span>
            <span style={{ ...resultsStyles.doneValue, color: colour }}>{steps}</span>
          </div>
          <div style={resultsStyles.doneStat}>
            <span style={resultsStyles.doneLabel}>Passengers</span>
            <span style={{ ...resultsStyles.doneValue, color: colour }}>{total}</span>
          </div>
          <div style={resultsStyles.doneStat}>
            <span style={resultsStyles.doneLabel}>Steps / pax</span>
            <span style={{ ...resultsStyles.doneValue, color: colour }}>
              {(steps / total).toFixed(2)}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

const resultsStyles = {
  empty : {
    background   : '#3B4252',
    borderRadius : '10px',
    border       : '1px solid #4C566A',
    padding      : '32px 20px',
    textAlign    : 'center',
    height       : '100%',
  },
  emptyIcon  : { fontSize: '32px', marginBottom: '10px' },
  emptyTitle : { color: '#88C0D0', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' },
  emptyText  : { color: '#6B7A8D', fontSize: '12px', lineHeight: '1.6' },
  container : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '12px',
  },
  meta : {
    display      : 'flex',
    alignItems   : 'center',
    gap          : '8px',
    background   : '#3B4252',
    borderRadius : '6px',
    padding      : '8px 12px',
    border       : '1px solid #4C566A',
  },
  metaIcon : { fontSize: '14px' },
  metaText : { fontSize: '12px', fontWeight: '600', color: '#D8DEE9' },
  methodDot : {
    width        : '10px',
    height       : '10px',
    borderRadius : '50%',
    flexShrink   : 0,
  },
  barTrack : {
    position     : 'relative',
    background   : '#434C5E',
    borderRadius : '6px',
    height       : '26px',
    overflow     : 'hidden',
  },
  barFill : {
    height       : '100%',
    borderRadius : '6px',
    transition   : 'width 0.1s linear',
  },
  barLabel : {
    position   : 'absolute',
    top        : '50%',
    left       : '50%',
    transform  : 'translate(-50%, -50%)',
    color      : '#ECEFF4',
    fontSize   : '12px',
    fontWeight : 'bold',
  },
  statGrid : {
    display             : 'grid',
    gridTemplateColumns : 'repeat(3, 1fr)',
    gap                 : '8px',
  },
  statBox : {
    background   : '#3B4252',
    borderRadius : '6px',
    padding      : '10px 8px',
    border       : '1px solid',
    textAlign    : 'center',
  },
  statValue : { fontSize: '15px', fontWeight: 'bold' },
  statLabel : { color: '#6B7A8D', fontSize: '10px', marginTop: '2px' },
  breakdown : {
    background   : '#3B4252',
    borderRadius : '8px',
    padding      : '12px',
    border       : '1px solid #4C566A',
  },
  breakdownTitle : {
    color         : '#6B7A8D',
    fontSize      : '10px',
    fontWeight    : '600',
    textTransform : 'uppercase',
    letterSpacing : '0.05em',
    marginBottom  : '8px',
  },
  typeRow : {
    display      : 'flex',
    alignItems   : 'center',
    gap          : '6px',
    marginBottom : '5px',
  },
  typeIcon     : { fontSize: '13px', minWidth: '18px' },
  typeName     : { fontSize: '11px', minWidth: '48px', fontWeight: '600' },
  typeBarTrack : {
    flex         : 1,
    background   : '#2E3440',
    borderRadius : '3px',
    height       : '6px',
    overflow     : 'hidden',
  },
  typeBarFill : {
    height       : '100%',
    borderRadius : '3px',
    transition   : 'width 0.3s ease',
  },
  typeCount : { color: '#A0AABB', fontSize: '11px', minWidth: '28px', textAlign: 'right' },
  doneBox : {
    background   : '#2E3440',
    borderRadius : '8px',
    padding      : '14px',
    border       : '1px solid #A3BE8C44',
  },
  doneTitle : {
    color        : '#A3BE8C',
    fontSize     : '13px',
    fontWeight   : 'bold',
    marginBottom : '10px',
    textAlign    : 'center',
  },
  doneStat : {
    display        : 'flex',
    justifyContent : 'space-between',
    alignItems     : 'center',
    padding        : '4px 0',
    borderBottom   : '1px solid #4C566A33',
  },
  doneLabel : { color: '#6B7A8D', fontSize: '12px' },
  doneValue : { fontSize: '14px', fontWeight: 'bold' },
};

// ─────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────
export default function App() {
  const {
    sim, progress, isRunning, methodName,
    start, pause, resume, reset, tick,
    stepForward, stepBackward,
  } = useSimulation();

  const [speed,       setSpeed]       = useState(4);
  const [tab,         setTab]         = useState('info');
  const [selected,    setSelected]    = useState('');
  const [aircraftKey, setAircraftKey] = useState(DEFAULT_AIRCRAFT);
  const [composition, setComposition] = useState({ ...DEFAULT_COMPOSITION });
  const [openPanel,   setOpenPanel]   = useState('aircraft');
  const [paxMode,     setPaxMode]     = useState('random');

  const currentAircraft = AIRCRAFT[aircraftKey];

  const [seatMap, setSeatMap] = useState(() =>
    assignPassengerTypes(totalPax(currentAircraft), DEFAULT_COMPOSITION)
  );

  const seatMapComposition = useMemo(() => {
    const counts = { male: 0, female: 0, elderly: 0, child: 0 };
    seatMap.forEach(t => { if (counts[t] !== undefined) counts[t]++; });
    const total = seatMap.length;
    const pcts  = {};
    Object.keys(counts).forEach(k => {
      pcts[k] = Math.round((counts[k] / total) * 100);
    });
    return pcts;
  }, [seatMap]);

  const compositionValid =
    paxMode === 'manual' ||
    Object.values(composition).reduce((a, b) => a + b, 0) === 100;

  const togglePanel = (panel) =>
    setOpenPanel(prev => prev === panel ? null : panel);

  useAnimationLoop(
    useCallback(() => tick(Math.max(1, Math.round(speed / 4))), [tick, speed]),
    isRunning
  );

  const handleAircraftChange = (key) => {
    if (isRunning) return;
    setAircraftKey(key);
    setSeatMap(assignPassengerTypes(totalPax(AIRCRAFT[key]), composition));
    reset();
    setOpenPanel('method');
  };

  const handleMethodChange = (name) => {
    setSelected(name);
    setOpenPanel('composition');
  };

  const handleCompositionChange = (newComp) => {
    setComposition(newComp);
    if (paxMode === 'random') {
      setSeatMap(assignPassengerTypes(totalPax(currentAircraft), newComp));
    }
  };

  const handleModeChange = (newMode) => {
    setPaxMode(newMode);
    if (newMode === 'random') {
      setSeatMap(assignPassengerTypes(totalPax(currentAircraft), composition));
    }
  };

  const handleSeatChange = useCallback((seatMapIdx, newType) => {
    setSeatMap(prev => {
      const next = [...prev];
      next[seatMapIdx] = newType;
      return next;
    });
  }, []);

  const handleStart = () => {
    if (!selected || !compositionValid) return;
    start(selected, aircraftKey, seatMap);
  };

  const primaryBtn = getPrimaryBtn({
    progress, isRunning, selected,
    onStart  : handleStart,
    onPause  : pause,
    onResume : resume,
  });

  const startDisabled  = primaryBtn.disabled || !compositionValid;
  const hasStarted     = !!progress;
  const canStepBack    = progress?.canStepBack ?? false;
  const canStepForward = hasStarted && !progress?.done;
  const showSeatMap    = paxMode === 'manual' && !hasStarted;

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <header style={styles.header}>
        <h1 style={styles.title}>Airplane Boarding Simulator</h1>
        <p style={styles.subtitle}>
          Visualise and compare different passenger boarding strategies
        </p>
      </header>

      {/* ── Tab Bar ── */}
      <div style={styles.tabBar}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              ...styles.tab,
              borderBottom    : tab === key ? '2px solid #5E81AC' : '2px solid transparent',
              color           : tab === key ? '#88C0D0' : '#6B7A8D',
              backgroundColor : tab === key ? '#5E81AC11' : 'transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Info Tab ── */}
      {tab === 'info' && <InfoPage />}

      {/* ── Animate Tab ── */}
      {tab === 'animate' && (
        <div style={styles.layout}>

          {/* ── LEFT: Inputs ── */}
          <div style={styles.leftCol}>

            <AircraftSelector
              selected={aircraftKey}
              onSelect={handleAircraftChange}
              disabled={isRunning}
              isOpen={openPanel === 'aircraft'}
              onToggle={() => togglePanel('aircraft')}
            />

            <MethodSelector
              selected={selected}
              onSelect={handleMethodChange}
              disabled={isRunning}
              isOpen={openPanel === 'method'}
              onToggle={() => togglePanel('method')}
            />

            <CompositionSelector
              composition={paxMode === 'manual' ? seatMapComposition : composition}
              onChange={handleCompositionChange}
              disabled={isRunning}
              isOpen={openPanel === 'composition'}
              onToggle={() => togglePanel('composition')}
              mode={paxMode}
              onModeChange={handleModeChange}
            />

            <SpeedControl
              speed={speed}
              onSpeedChange={setSpeed}
              disabled={false}
              isOpen={openPanel === 'speed'}
              onToggle={() => togglePanel('speed')}
            />

            {/* Action buttons */}
            <div style={styles.btnRow}>
              <button
                onClick={primaryBtn.action}
                disabled={startDisabled}
                style={{
                  ...styles.btn,
                  flex       : 3,
                  background : startDisabled ? '#3B4252' : primaryBtn.colour,
                  opacity    : startDisabled ? 0.4 : 1,
                  cursor     : startDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {primaryBtn.label}
                {!compositionValid && !progress && (
                  <span style={{ fontSize: '11px', marginLeft: '6px', opacity: 0.8 }}>
                    (fix mix first)
                  </span>
                )}
              </button>
              <button
                onClick={reset}
                disabled={!hasStarted}
                style={{ ...styles.btn, flex: 1, background: '#BF616A' }}
              >
                ↺
              </button>
            </div>

            <div style={styles.btnRow}>
              <button
                onClick={stepBackward}
                disabled={!canStepBack}
                style={{ ...styles.btn, flex: 1, background: '#434C5E' }}
              >
                ⏮ Back
              </button>
              <button
                onClick={stepForward}
                disabled={!canStepForward}
                style={{ ...styles.btn, flex: 1, background: '#434C5E' }}
              >
                Forward ⏭
              </button>
            </div>

          </div>

          {/* ── MIDDLE: Legend + Canvas ── */}
          <div style={styles.middleCol}>
            <ColourLegend paxMode={paxMode} />

            {showSeatMap ? (
              <div style={styles.seatMapPanel}>
                <div style={styles.seatMapHeader}>
                  <span style={styles.seatMapTitle}>✏️ Manual Seat Assignment</span>
                  <span style={styles.seatMapSub}>
                    Click any seat to cycle: 🧑 → 👩 → 🧓 → 🧒 → 🧑
                  </span>
                </div>
                <div style={styles.seatMapCounts}>
                  {Object.entries(PASSENGER_TYPES).map(([key, pt]) => {
                    const count = seatMap.filter(t => t === key).length;
                    const pct   = Math.round((count / seatMap.length) * 100);
                    return (
                      <div key={key} style={styles.countItem}>
                        <span style={styles.countIcon}>{pt.icon}</span>
                        <div style={styles.countBarTrack}>
                          <div style={{
                            ...styles.countBarFill,
                            width      : `${pct}%`,
                            background : pt.colour,
                          }} />
                        </div>
                        <span style={{ ...styles.countLabel, color: pt.colour }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
                <SeatMapEditor
                  aircraft={currentAircraft}
                  seatMap={seatMap}
                  onSeatChange={handleSeatChange}
                />
              </div>
            ) : (
              <CabinCanvas
                sim={sim}
                progress={progress}
                aircraft={currentAircraft}
              />
            )}
          </div>

          {/* ── RIGHT: Stats + Results ── */}
          <div style={styles.rightCol}>
            <ResultsPanel
              progress={progress}
              methodName={methodName}
              aircraftLabel={currentAircraft?.label}
              isRunning={isRunning}
              seatMap={seatMap}
              paxMode={paxMode}
            />
          </div>

        </div>
      )}

      {/* ── Compare Tab ── */}
      {tab === 'compare' && (
        <div style={styles.compareWrapper}>
          <ComparisonChart />
        </div>
      )}

    </div>
  );
}

const styles = {
  page : {
    minHeight  : '100vh',
    background : '#2E3440',
    color      : '#ECEFF4',
    fontFamily : "'Segoe UI', system-ui, sans-serif",
  },
  header : {
    textAlign    : 'center',
    padding      : '24px 20px 12px',
    borderBottom : '1px solid #3B4252',
  },
  title : {
    margin   : 0,
    fontSize : '26px',
    color    : '#88C0D0',
  },
  subtitle : {
    margin   : '4px 0 0',
    color    : '#6B7A8D',
    fontSize : '13px',
  },
  tabBar : {
    display        : 'flex',
    justifyContent : 'center',
    gap            : '4px',
    padding        : '8px 20px',
    borderBottom   : '1px solid #3B4252',
  },
  tab : {
    background    : 'transparent',
    border        : 'none',
    borderBottom  : '2px solid transparent',
    padding       : '8px 24px',
    cursor        : 'pointer',
    fontSize      : '14px',
    fontWeight    : '600',
    fontFamily    : 'inherit',
    transition    : 'all 0.2s',
    borderRadius  : '6px 6px 0 0',
  },

  // ── Three column layout ──────────────────────
  layout : {
    display             : 'grid',
    gridTemplateColumns : '260px 1fr 220px',
    gap                 : '16px',
    maxWidth            : '1400px',
    margin              : '20px auto',
    padding             : '0 20px',
    alignItems          : 'start',
  },
  leftCol : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '10px',
    position      : 'sticky',
    top           : '20px',
  },
  middleCol : {
    display       : 'flex',
    flexDirection : 'column',
    minWidth      : 0,
  },
  rightCol : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '10px',
    position      : 'sticky',
    top           : '20px',
  },

  // ── Buttons ──────────────────────────────────
  btnRow : {
    display : 'flex',
    gap     : '8px',
  },
  btn : {
    padding      : '10px 0',
    borderRadius : '6px',
    border       : 'none',
    cursor       : 'pointer',
    fontSize     : '13px',
    fontWeight   : 'bold',
    color        : '#ECEFF4',
    fontFamily   : 'inherit',
    transition   : 'background 0.2s, opacity 0.2s',
  },

  // ── Seat map panel ────────────────────────────
  seatMapPanel : {
    background   : '#3B4252',
    borderRadius : '10px',
    border       : '1px solid #4C566A',
    padding      : '14px',
  },
  seatMapHeader : { marginBottom: '10px' },
  seatMapTitle  : {
    display    : 'block',
    fontSize   : '13px',
    fontWeight : 'bold',
    color      : '#88C0D0',
  },
  seatMapSub : {
    display   : 'block',
    fontSize  : '11px',
    color     : '#6B7A8D',
    marginTop : '2px',
  },
  seatMapCounts : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '4px',
    background    : '#2E3440',
    borderRadius  : '6px',
    padding       : '8px 10px',
    marginBottom  : '10px',
  },
  countItem : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '6px',
  },
  countIcon     : { fontSize: '13px', minWidth: '18px' },
  countBarTrack : {
    flex         : 1,
    background   : '#3B4252',
    borderRadius : '3px',
    height       : '5px',
    overflow     : 'hidden',
  },
  countBarFill : {
    height       : '100%',
    borderRadius : '3px',
    transition   : 'width 0.2s ease',
  },
  countLabel : {
    fontSize   : '11px',
    minWidth   : '70px',
    textAlign  : 'right',
    fontWeight : '600',
  },

  compareWrapper : {
    maxWidth : '900px',
    margin   : '24px auto',
    padding  : '0 20px 40px',
  },
};