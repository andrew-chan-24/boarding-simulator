import React, { useState, useCallback }  from 'react';
import MethodSelector      from './MethodSelector';
import SpeedControl        from './SpeedControl';
import StatsPanel          from './StatsPanel';
import CabinCanvas         from './CabinCanvas';
import ComparisonChart     from './ComparisonChart';
import AircraftSelector    from './AircraftSelector';
import CompositionSelector from './CompositionSelector';
import InfoPage            from './InfoPage';
import { useSimulation }     from '../hooks/useSimulation';
import { useAnimationLoop }  from '../hooks/useAnimationLoop';
import { AIRCRAFT, DEFAULT_AIRCRAFT, DEFAULT_COMPOSITION } from '../simulation/constants';

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

const TABS = [
  { key: 'info',    label: 'ℹ️ About'   },
  { key: 'animate', label: '🎬 Animate' },
  { key: 'compare', label: '📊 Compare' },
];

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

  const compositionValid =
    Object.values(composition).reduce((a, b) => a + b, 0) === 100;

  const togglePanel = (panel) =>
    setOpenPanel(prev => prev === panel ? null : panel);

  useAnimationLoop(
    useCallback(() => tick(Math.max(1, Math.round(speed / 4))), [tick, speed]),
    isRunning
  );

  const handleStart = () => {
    if (!selected || !compositionValid) return;
    start(selected, aircraftKey, composition);
  };

  const handleAircraftChange = (key) => {
    if (isRunning) return;
    setAircraftKey(key);
    reset();
    setOpenPanel('method');
  };

  const handleMethodChange = (name) => {
    setSelected(name);
    setOpenPanel('composition');
  };

  const primaryBtn     = getPrimaryBtn({
    progress, isRunning, selected,
    onStart  : handleStart,
    onPause  : pause,
    onResume : resume,
  });

  const startDisabled  = primaryBtn.disabled || !compositionValid;
  const hasStarted     = !!progress;
  const canStepBack    = progress?.canStepBack ?? false;
  const canStepForward = hasStarted && !progress?.done;
  const currentAircraft = AIRCRAFT[aircraftKey];

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <header style={styles.header}>
        <h1 style={styles.title}>✈ Airplane Boarding Simulator</h1>
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
          <div style={styles.sidebar}>

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
              composition={composition}
              onChange={setComposition}
              disabled={isRunning}
              isOpen={openPanel === 'composition'}
              onToggle={() => togglePanel('composition')}
            />

            <SpeedControl
              speed={speed}
              onSpeedChange={setSpeed}
              disabled={false}
              isOpen={openPanel === 'speed'}
              onToggle={() => togglePanel('speed')}
            />

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
                title="Step back one simulation step"
                style={{ ...styles.btn, flex: 1, background: '#434C5E' }}
              >
                ⏮ Back
              </button>
              <button
                onClick={stepForward}
                disabled={!canStepForward}
                title="Step forward one simulation step"
                style={{ ...styles.btn, flex: 1, background: '#434C5E' }}
              >
                Forward ⏭
              </button>
            </div>

            <StatsPanel
              progress={progress}
              methodName={methodName}
              aircraftLabel={currentAircraft?.label}
              isRunning={isRunning}
            />

          </div>

          <div style={styles.canvasWrapper}>
            <CabinCanvas
              sim={sim}
              progress={progress}
              aircraft={currentAircraft}
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
    padding      : '32px 20px 16px',
    borderBottom : '1px solid #3B4252',
  },
  title : {
    margin   : 0,
    fontSize : '28px',
    color    : '#88C0D0',
  },
  subtitle : {
    margin   : '6px 0 0',
    color    : '#6B7A8D',
    fontSize : '14px',
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
  layout : {
    display             : 'grid',
    gridTemplateColumns : '300px 1fr',
    gap                 : '20px',
    maxWidth            : '1200px',
    margin              : '24px auto',
    padding             : '0 20px',
    alignItems          : 'start',
  },
  sidebar : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '10px',
  },
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
  canvasWrapper : {
    display        : 'flex',
    justifyContent : 'center',
    alignItems     : 'flex-start',
    paddingTop     : '4px',
    overflowX      : 'auto',
  },
  compareWrapper : {
    maxWidth : '900px',
    margin   : '24px auto',
    padding  : '0 20px 40px',
  },
};