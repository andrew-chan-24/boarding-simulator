import React from 'react';
import { COLOURS, METHOD_COLOURS, PASSENGER_TYPES } from '../simulation/constants';

function StatBox({ label, value, colour }) {
  return (
    <div style={{ ...styles.box, borderColor: colour || COLOURS.BORDER }}>
      <div style={{ ...styles.boxValue, color: colour || '#ECEFF4' }}>{value}</div>
      <div style={styles.boxLabel}>{label}</div>
    </div>
  );
}

function ProgressBar({ pct, colour }) {
  return (
    <div style={styles.barTrack}>
      <div style={{
        ...styles.barFill,
        width      : `${pct}%`,
        background : colour || '#5E81AC',
        boxShadow  : `0 0 8px ${colour || '#5E81AC'}88`,
      }} />
      <span style={styles.barLabel}>{pct}%</span>
    </div>
  );
}

export default function StatsPanel({ progress, methodName, aircraftLabel, isRunning }) {
  if (!progress) {
    return (
      <div style={styles.container}>
        <h3 style={styles.heading}>📊 Stats</h3>
        <p style={styles.idle}>Select an aircraft and method, then press Start.</p>
      </div>
    );
  }

  const { seated, total, pct, steps, done, typeCounts } = progress;
  const colour = METHOD_COLOURS[methodName] || '#5E81AC';

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>📊 Stats</h3>

      {aircraftLabel && (
        <div style={styles.aircraftLabel}>{aircraftLabel}</div>
      )}

      <ProgressBar pct={pct} colour={colour} />

      <div style={styles.grid}>
        <StatBox label="Seated" value={`${seated}/${total}`} colour={colour} />
        <StatBox label="Steps"  value={steps}                colour={colour} />
        <StatBox
          label="Status"
          value={done ? '✅ Done' : isRunning ? '▶ Running' : '⏸ Paused'}
        />
      </div>

      {/* Passenger type breakdown */}
      {typeCounts && (
        <div style={styles.typeBreakdown}>
          <div style={styles.typeTitle}>Passenger Composition</div>
          {Object.entries(PASSENGER_TYPES).map(([key, pt]) => {
            const count = typeCounts[key] || 0;
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} style={styles.typeRow}>
                <span style={styles.typeIcon}>{pt.icon}</span>
                <span style={{ ...styles.typeName, color: pt.colour }}>
                  {pt.label}
                </span>
                <div style={styles.typeBarTrack}>
                  <div style={{
                    ...styles.typeBarFill,
                    width      : `${pct}%`,
                    background : pt.colour,
                  }} />
                </div>
                <span style={styles.typeCount}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Colour legend */}
      <div style={styles.legend}>
        {Object.entries(PASSENGER_TYPES).map(([key, pt]) => (
          <div key={key} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: pt.colour }} />
            <span style={styles.legendLabel}>{pt.label}</span>
          </div>
        ))}
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: COLOURS.STOWING }} />
          <span style={styles.legendLabel}>Stowing</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: COLOURS.WAITING }} />
          <span style={styles.legendLabel}>Blocked</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: COLOURS.EMPTY }} />
          <span style={styles.legendLabel}>Empty</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container : {
    background   : '#3B4252',
    borderRadius : '10px',
    padding      : '16px 20px',
    border       : '1px solid #4C566A',
  },
  heading : {
    color         : '#88C0D0',
    margin        : '0 0 8px',
    fontSize      : '14px',
    fontWeight    : 'bold',
    letterSpacing : '0.05em',
    textTransform : 'uppercase',
  },
  aircraftLabel : {
    color        : '#6B7A8D',
    fontSize     : '11px',
    marginBottom : '8px',
  },
  idle : {
    color    : '#6B7A8D',
    fontSize : '13px',
  },
  barTrack : {
    position     : 'relative',
    background   : '#434C5E',
    borderRadius : '6px',
    height       : '22px',
    overflow     : 'hidden',
    marginBottom : '12px',
  },
  barFill : {
    height       : '100%',
    borderRadius : '6px',
    transition   : 'width 0.1s linear',
  },
  barLabel : {
    position  : 'absolute',
    top       : '50%',
    left      : '50%',
    transform : 'translate(-50%, -50%)',
    color     : '#ECEFF4',
    fontSize  : '12px',
    fontWeight: 'bold',
  },
  grid : {
    display             : 'grid',
    gridTemplateColumns : 'repeat(3, 1fr)',
    gap                 : '8px',
    marginBottom        : '12px',
  },
  box : {
    background   : '#2E3440',
    borderRadius : '6px',
    padding      : '8px',
    border       : '1px solid',
    textAlign    : 'center',
  },
  boxValue : {
    fontSize   : '15px',
    fontWeight : 'bold',
  },
  boxLabel : {
    color    : '#6B7A8D',
    fontSize : '10px',
    marginTop: '2px',
  },
  typeBreakdown : {
    background   : '#2E3440',
    borderRadius : '6px',
    padding      : '8px 10px',
    marginBottom : '10px',
  },
  typeTitle : {
    color         : '#6B7A8D',
    fontSize      : '10px',
    fontWeight    : '600',
    textTransform : 'uppercase',
    letterSpacing : '0.05em',
    marginBottom  : '6px',
  },
  typeRow : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '6px',
    marginBottom: '4px',
  },
  typeIcon : {
    fontSize : '13px',
    minWidth : '18px',
  },
  typeName : {
    fontSize : '11px',
    minWidth : '48px',
    fontWeight: '600',
  },
  typeBarTrack : {
    flex         : 1,
    background   : '#3B4252',
    borderRadius : '3px',
    height       : '6px',
    overflow     : 'hidden',
  },
  typeBarFill : {
    height       : '100%',
    borderRadius : '3px',
    transition   : 'width 0.3s ease',
  },
  typeCount : {
    color    : '#A0AABB',
    fontSize : '11px',
    minWidth : '28px',
    textAlign: 'right',
  },
  legend : {
    display  : 'flex',
    flexWrap : 'wrap',
    gap      : '6px',
  },
  legendItem : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '4px',
  },
  legendDot : {
    width        : '10px',
    height       : '10px',
    borderRadius : '3px',
    flexShrink   : 0,
  },
  legendLabel : {
    color    : '#A0AABB',
    fontSize : '11px',
  },
};