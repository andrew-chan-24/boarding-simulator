import React from 'react';

const SPEED_PRESETS = [
  { label: '0.25×', value: 1  },
  { label: '0.5×',  value: 2  },
  { label: '1×',    value: 4  },
  { label: '2×',    value: 8  },
  { label: '4×',    value: 16 },
];

export default function SpeedControl({ speed, onSpeedChange, disabled, isOpen, onToggle }) {
  const currentPreset = SPEED_PRESETS.find(p => p.value === speed);

  return (
    <div style={styles.container}>

      {/* ── Header / Toggle ── */}
      <button
        onClick={onToggle}
        disabled={disabled}
        style={styles.header}
      >
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>⚡</span>
          <div>
            <div style={styles.headerTitle}>Speed</div>
            <div style={styles.headerSub}>
              {currentPreset ? currentPreset.label : `${speed}×`}
            </div>
          </div>
        </div>
        <span style={{
          ...styles.chevron,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▾
        </span>
      </button>

      {/* ── Dropdown Body ── */}
      {isOpen && (
        <div style={styles.body}>
          <div style={styles.presets}>
            {SPEED_PRESETS.map(({ label, value }) => {
              const isActive = speed === value;
              return (
                <button
                  key={value}
                  onClick={() => onSpeedChange(value)}
                  disabled={disabled}
                  style={{
                    ...styles.preset,
                    backgroundColor : isActive ? '#5E81AC' : '#434C5E',
                    color           : isActive ? '#ECEFF4' : '#A0AABB',
                    borderColor     : isActive ? '#5E81AC' : '#4C566A',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={styles.sliderRow}>
            <span style={styles.sliderLabel}>Fine:</span>
            <input
              type="range"
              min={1}
              max={16}
              step={1}
              value={speed}
              disabled={disabled}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.sliderValue}>
              {currentPreset?.label ?? `${speed}`}
            </span>
          </div>
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
  headerIcon : {
    fontSize : '18px',
  },
  headerTitle : {
    fontSize      : '13px',
    fontWeight    : 'bold',
    color         : '#88C0D0',
    textTransform : 'uppercase',
    letterSpacing : '0.05em',
  },
  headerSub : {
    fontSize  : '12px',
    color     : '#A0AABB',
    marginTop : '2px',
  },
  chevron : {
    fontSize   : '18px',
    color      : '#6B7A8D',
    transition : 'transform 0.25s ease',
    lineHeight : 1,
  },
  body : {
    padding   : '12px 16px 16px',
    borderTop : '1px solid #4C566A',
  },
  presets : {
    display  : 'flex',
    gap      : '6px',
    flexWrap : 'wrap',
  },
  preset : {
    padding      : '5px 12px',
    borderRadius : '5px',
    border       : '1px solid',
    cursor       : 'pointer',
    fontSize     : '12px',
    fontWeight   : '600',
    transition   : 'all 0.15s ease',
    fontFamily   : 'inherit',
  },
  sliderRow : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '10px',
    marginTop  : '12px',
  },
  sliderLabel : {
    color    : '#A0AABB',
    fontSize : '12px',
    minWidth : '30px',
  },
  slider : {
    flex        : 1,
    cursor      : 'pointer',
    accentColor : '#5E81AC',
  },
  sliderValue : {
    color    : '#D8DEE9',
    fontSize : '12px',
    minWidth : '30px',
  },
};