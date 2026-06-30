import React from 'react';
import { BOARDING_METHODS } from '../simulation/boardingOrders';
import { METHOD_COLOURS }   from '../simulation/constants';

const methods = Object.keys(BOARDING_METHODS);

const descriptions = {
  'Random'          : 'Passengers board in a completely shuffled order.',
  'Back-to-Front'   : 'Rear rows board first, progressively moving forward.',
  'Front-to-Back'   : 'Front rows board first — typically the slowest method.',
  'WILMA'           : 'Window → Middle → Aisle seats, regardless of row.',
  'Steffen'         : 'Window seats, alternating odd/even rows back-to-front, then middle, then aisle. Scientifically the fastest.',
  "Andrew's Method" : 'Boards in strict ascending seat number order — row 1 seat A through to the last row last seat.',
};

export default function MethodSelector({ selected, onSelect, disabled, isOpen, onToggle }) {
  const colour = selected ? METHOD_COLOURS[selected] : null;

  return (
    <div style={styles.container}>

      {/* ── Header / Toggle ── */}
      <button
        onClick={onToggle}
        disabled={disabled}
        style={styles.header}
      >
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>✈</span>
          <div>
            <div style={styles.headerTitle}>Boarding Method</div>
            {selected && (
              <div style={styles.headerSub}>
                <span style={{ ...styles.dot, background: colour }} />
                <span style={{ color: colour }}>{selected}</span>
              </div>
            )}
            {!selected && (
              <div style={styles.headerPlaceholder}>Select a method…</div>
            )}
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
          <div style={styles.list}>
            {methods.map((name) => {
              const isActive = name === selected;
              const c        = METHOD_COLOURS[name];
              return (
                <button
                  key={name}
                  onClick={() => onSelect(name)}
                  disabled={disabled}
                  style={{
                    ...styles.item,
                    backgroundColor : isActive ? c + '22' : 'transparent',
                    borderLeft      : `3px solid ${isActive ? c : 'transparent'}`,
                    color           : isActive ? c : '#D8DEE9',
                  }}
                >
                  <span style={{ ...styles.itemDot, background: c }} />
                  <div style={styles.itemText}>
                    <div style={styles.itemName}>{name}</div>
                    <div style={styles.itemDesc}>{descriptions[name]}</div>
                  </div>
                  {isActive && <span style={styles.tick}>✓</span>}
                </button>
              );
            })}
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
    display    : 'flex',
    alignItems : 'center',
    gap        : '6px',
    marginTop  : '2px',
    fontSize   : '12px',
    fontWeight : '600',
  },
  headerPlaceholder : {
    fontSize  : '12px',
    color     : '#6B7A8D',
    marginTop : '2px',
    fontStyle : 'italic',
  },
  dot : {
    width        : '8px',
    height       : '8px',
    borderRadius : '50%',
    flexShrink   : 0,
    display      : 'inline-block',
  },
  chevron : {
    fontSize   : '18px',
    color      : '#6B7A8D',
    transition : 'transform 0.25s ease',
    lineHeight : 1,
  },
  body : {
    borderTop : '1px solid #4C566A',
  },
  list : {
    display       : 'flex',
    flexDirection : 'column',
  },
  item : {
    display        : 'flex',
    alignItems     : 'center',
    gap            : '10px',
    padding        : '10px 16px',
    background     : 'transparent',
    border         : 'none',
    borderLeft     : '3px solid transparent',
    cursor         : 'pointer',
    fontFamily     : 'inherit',
    textAlign      : 'left',
    transition     : 'background 0.15s ease',
    width          : '100%',
  },
  itemDot : {
    width        : '10px',
    height       : '10px',
    borderRadius : '50%',
    flexShrink   : 0,
  },
  itemText : {
    flex : 1,
  },
  itemName : {
    fontSize   : '13px',
    fontWeight : '600',
    lineHeight : 1.3,
  },
  itemDesc : {
    fontSize   : '11px',
    color      : '#6B7A8D',
    marginTop  : '2px',
    lineHeight : '1.4',
  },
  tick : {
    color      : 'inherit',
    fontSize   : '14px',
    fontWeight : 'bold',
    flexShrink : 0,
  },
};