import React from 'react';
import { PASSENGER_TYPES, DEFAULT_COMPOSITION } from '../simulation/constants';

const TYPES = Object.keys(PASSENGER_TYPES);

export default function CompositionSelector({
  composition,
  onChange,
  disabled,
  isOpen,
  onToggle,
  mode,           // 'random' | 'manual'
  onModeChange,
}) {
  const safeComp = composition || DEFAULT_COMPOSITION;
  const total    = Object.values(safeComp).reduce((a, b) => a + b, 0);
  const valid    = mode === 'manual' || total === 100;

  const handleChange = (type, raw) => {
    const val     = Math.max(0, Math.min(100, Number(raw) || 0));
    onChange({ ...safeComp, [type]: val });
  };

  const handleReset = () => onChange({ ...DEFAULT_COMPOSITION });

  return (
    <div style={styles.container}>

      {/* ── Header ── */}
      <button onClick={onToggle} disabled={disabled} style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>👥</span>
          <div>
            <div style={styles.headerTitle}>Passenger Mix</div>
            <div style={styles.headerSub}>
              {mode === 'random' ? (
                TYPES.map(t => (
                  <span key={t} style={{ color: PASSENGER_TYPES[t].colour }}>
                    {PASSENGER_TYPES[t].icon}{safeComp[t]}%{' '}
                  </span>
                ))
              ) : (
                <span style={{ color: '#88C0D0' }}>Manual seat assignment</span>
              )}
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          {mode === 'random' && !valid && (
            <span style={styles.warning}>⚠ {total}%</span>
          )}
          {mode === 'random' && valid && (
            <span style={styles.validLabel}>✓ 100%</span>
          )}
          <span style={{
            ...styles.chevron,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>▾</span>
        </div>
      </button>

      {/* ── Body ── */}
      {isOpen && (
        <div style={styles.body}>

          {/* ── Mode toggle switch ── */}
          <div style={styles.modeRow}>
            <span style={styles.modeLabel}>Distribution mode:</span>
            <div style={styles.toggle}>
              <button
                onClick={() => onModeChange('random')}
                disabled={disabled}
                style={{
                  ...styles.toggleBtn,
                  background  : mode === 'random' ? '#5E81AC' : '#2E3440',
                  color       : mode === 'random' ? '#ECEFF4' : '#6B7A8D',
                  borderRadius: '6px 0 0 6px',
                }}
              >
                🎲 Random
              </button>
              <button
                onClick={() => onModeChange('manual')}
                disabled={disabled}
                style={{
                  ...styles.toggleBtn,
                  background  : mode === 'manual' ? '#5E81AC' : '#2E3440',
                  color       : mode === 'manual' ? '#ECEFF4' : '#6B7A8D',
                  borderRadius: '0 6px 6px 0',
                }}
              >
                ✏️ Manual
              </button>
            </div>
          </div>

          {/* ── Random mode: sliders ── */}
          {mode === 'random' && (
            <>
              {TYPES.map(type => {
                const pt = PASSENGER_TYPES[type];
                return (
                  <div key={type} style={styles.row}>
                    <div style={styles.typeLabel}>
                      <span style={styles.typeIcon}>{pt.icon}</span>
                      <div>
                        <div style={{ ...styles.typeName, color: pt.colour }}>
                          {pt.label}
                        </div>
                        <div style={styles.typeStat}>
                          Stow: {pt.luggage} steps
                        </div>
                      </div>
                    </div>
                    <div style={styles.sliderWrap}>
                      <input
                        type="range"
                        min={0} max={100} step={5}
                        value={safeComp[type]}
                        disabled={disabled}
                        onChange={e => handleChange(type, e.target.value)}
                        style={{ ...styles.slider, accentColor: pt.colour }}
                      />
                    </div>
                    <input
                      type="number"
                      min={0} max={100} step={5}
                      value={safeComp[type]}
                      disabled={disabled}
                      onChange={e => handleChange(type, e.target.value)}
                      style={styles.numInput}
                    />
                    <span style={styles.pct}>%</span>
                  </div>
                );
              })}

              {/* Total indicator */}
              <div style={styles.totalRow}>
                <div style={{
                  ...styles.totalBar,
                  background : valid ? '#A3BE8C22' : '#BF616A22',
                  border     : `1px solid ${valid ? '#A3BE8C' : '#BF616A'}`,
                }}>
                  <span style={{
                    color      : valid ? '#A3BE8C' : '#BF616A',
                    fontWeight : 'bold',
                  }}>
                    Total: {total}%
                  </span>
                  {!valid && (
                    <span style={{
                      color     : '#BF616A',
                      fontSize  : '11px',
                      marginLeft: '8px',
                    }}>
                      Must equal 100%
                    </span>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  disabled={disabled}
                  style={styles.resetBtn}
                >
                  Reset
                </button>
              </div>
            </>
          )}

          {/* ── Manual mode: info ── */}
          {mode === 'manual' && (
            <div style={styles.manualInfo}>
              <div style={styles.manualInfoIcon}>✏️</div>
              <div style={styles.manualInfoText}>
                The seat map will appear in the main panel.
                Click any seat to cycle through passenger types.
                The composition counts will update automatically.
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

const styles = {
  container : {
    background   : '#3B4252',
    borderRadius : '10px',
    border       : '1px solid #4C566A',
    overflow     : 'hidden',
  },
  header : {
    width          : '100%',
    display        : 'flex',
    alignItems     : 'center',
    justifyContent : 'space-between',
    padding        : '12px 16px',
    background     : 'transparent',
    border         : 'none',
    cursor         : 'pointer',
    fontFamily     : 'inherit',
    color          : '#ECEFF4',
    textAlign      : 'left',
  },
  headerLeft : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '10px',
  },
  headerIcon  : { fontSize: '18px' },
  headerTitle : {
    fontSize      : '13px',
    fontWeight    : 'bold',
    color         : '#88C0D0',
    textTransform : 'uppercase',
    letterSpacing : '0.05em',
  },
  headerSub : {
    fontSize  : '11px',
    marginTop : '2px',
  },
  headerRight : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '8px',
  },
  warning    : { color: '#BF616A', fontSize: '11px', fontWeight: 'bold' },
  validLabel : { color: '#A3BE8C', fontSize: '11px', fontWeight: 'bold' },
  chevron : {
    fontSize   : '18px',
    color      : '#6B7A8D',
    transition : 'transform 0.25s ease',
    lineHeight : 1,
  },
  body : {
    padding   : '12px 16px 14px',
    borderTop : '1px solid #4C566A',
  },
  modeRow : {
    display      : 'flex',
    alignItems   : 'center',
    gap          : '10px',
    marginBottom : '14px',
    flexWrap     : 'wrap',
  },
  modeLabel : {
    color    : '#A0AABB',
    fontSize : '12px',
  },
  toggle : {
    display : 'flex',
  },
  toggleBtn : {
    padding    : '6px 14px',
    border     : '1px solid #4C566A',
    cursor     : 'pointer',
    fontSize   : '12px',
    fontWeight : '600',
    fontFamily : 'inherit',
    transition : 'all 0.15s',
  },
  row : {
    display      : 'flex',
    alignItems   : 'center',
    gap          : '8px',
    padding      : '6px 0',
    borderBottom : '1px solid #2E344022',
  },
  typeLabel : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '6px',
    minWidth   : '90px',
  },
  typeIcon   : { fontSize: '16px' },
  typeName   : { fontSize: '12px', fontWeight: '600' },
  typeStat   : { fontSize: '10px', color: '#6B7A8D' },
  sliderWrap : { flex: 1 },
  slider     : { width: '100%', cursor: 'pointer' },
  numInput : {
    width        : '44px',
    background   : '#2E3440',
    border       : '1px solid #4C566A',
    borderRadius : '4px',
    color        : '#ECEFF4',
    fontSize     : '12px',
    padding      : '3px 4px',
    textAlign    : 'center',
    fontFamily   : 'inherit',
  },
  pct : { color: '#6B7A8D', fontSize: '12px', minWidth: '12px' },
  totalRow : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '8px',
    marginTop  : '10px',
  },
  totalBar : {
    flex         : 1,
    padding      : '5px 10px',
    borderRadius : '5px',
    fontSize     : '12px',
  },
  resetBtn : {
    background   : '#434C5E',
    color        : '#A0AABB',
    border       : '1px solid #4C566A',
    borderRadius : '5px',
    padding      : '5px 10px',
    cursor       : 'pointer',
    fontSize     : '11px',
    fontFamily   : 'inherit',
  },
  manualInfo : {
    display      : 'flex',
    alignItems   : 'flex-start',
    gap          : '10px',
    background   : '#2E3440',
    borderRadius : '8px',
    padding      : '12px',
    marginTop    : '4px',
  },
  manualInfoIcon : { fontSize: '20px', flexShrink: 0 },
  manualInfoText : {
    color      : '#88C0D0',
    fontSize   : '12px',
    lineHeight : '1.6',
  },
};