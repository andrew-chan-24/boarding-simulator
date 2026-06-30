import React from 'react';
import { AIRCRAFT } from '../simulation/constants';

const NARROW = Object.entries(AIRCRAFT).filter(([, v]) => v.type === 'narrow');
const WIDE   = Object.entries(AIRCRAFT).filter(([, v]) => v.type === 'wide');

export default function AircraftSelector({ selected, onSelect, disabled, isOpen, onToggle }) {
  const selectedAircraft = AIRCRAFT[selected];

  return (
    <div style={styles.container}>

      {/* ── Header / Toggle ── */}
      <button
        onClick={onToggle}
        disabled={disabled}
        style={styles.header}
      >
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>🛫</span>
          <div>
            <div style={styles.headerTitle}>Aircraft Type</div>
            {selected && (
              <div style={styles.headerSub}>
                {selectedAircraft.icon} {selectedAircraft.label}
                <span style={{
                  ...styles.typeBadge,
                  background: selectedAircraft.type === 'narrow' ? '#5E81AC33' : '#A3BE8C33',
                  color     : selectedAircraft.type === 'narrow' ? '#5E81AC'   : '#A3BE8C',
                  border    : `1px solid ${selectedAircraft.type === 'narrow' ? '#5E81AC' : '#A3BE8C'}`,
                }}>
                  {selectedAircraft.type === 'narrow' ? 'Single Aisle' : 'Twin Aisle'}
                </span>
              </div>
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

          <div style={styles.groupLabel}>Narrow Body — Single Aisle</div>
          <div style={styles.grid}>
            {NARROW.map(([id, ac]) => (
              <button
                key={id}
                onClick={() => { onSelect(id); }}
                disabled={disabled}
                style={{
                  ...styles.card,
                  borderColor     : selected === id ? '#88C0D0' : '#4C566A',
                  backgroundColor : selected === id ? '#88C0D022' : '#2E3440',
                  color           : selected === id ? '#88C0D0'   : '#D8DEE9',
                  boxShadow       : selected === id ? '0 0 8px #88C0D044' : 'none',
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.cardIcon}>{ac.icon}</span>
                  <span style={styles.cardLabel}>{id}</span>
                </div>
                <div style={styles.cardFull}>{ac.label}</div>
                <div style={styles.cardSub}>{ac.description}</div>
              </button>
            ))}
          </div>

          <div style={{ ...styles.groupLabel, marginTop: '12px' }}>
            Wide Body — Twin Aisle
          </div>
          <div style={styles.grid}>
            {WIDE.map(([id, ac]) => (
              <button
                key={id}
                onClick={() => { onSelect(id); }}
                disabled={disabled}
                style={{
                  ...styles.card,
                  borderColor     : selected === id ? '#A3BE8C' : '#4C566A',
                  backgroundColor : selected === id ? '#A3BE8C22' : '#2E3440',
                  color           : selected === id ? '#A3BE8C'   : '#D8DEE9',
                  boxShadow       : selected === id ? '0 0 8px #A3BE8C44' : 'none',
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.cardIcon}>{ac.icon}</span>
                  <span style={styles.cardLabel}>{id}</span>
                </div>
                <div style={styles.cardFull}>{ac.label}</div>
                <div style={styles.cardSub}>{ac.description}</div>
              </button>
            ))}
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
    fontSize     : '13px',
    fontWeight   : 'bold',
    color        : '#88C0D0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  headerSub : {
    fontSize   : '12px',
    color      : '#A0AABB',
    marginTop  : '2px',
    display    : 'flex',
    alignItems : 'center',
    gap        : '6px',
  },
  typeBadge : {
    fontSize     : '10px',
    padding      : '1px 6px',
    borderRadius : '10px',
    fontWeight   : '600',
  },
  chevron : {
    fontSize   : '18px',
    color      : '#6B7A8D',
    transition : 'transform 0.25s ease',
    lineHeight : 1,
  },
  body : {
    padding    : '4px 16px 16px',
    borderTop  : '1px solid #4C566A',
  },
  groupLabel : {
    color         : '#6B7A8D',
    fontSize      : '10px',
    fontWeight    : '600',
    textTransform : 'uppercase',
    letterSpacing : '0.06em',
    margin        : '10px 0 6px',
  },
  grid : {
    display             : 'grid',
    gridTemplateColumns : 'repeat(3, 1fr)',
    gap                 : '6px',
  },
  card : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '2px',
    padding       : '8px 6px',
    borderRadius  : '6px',
    border        : '1px solid',
    cursor        : 'pointer',
    textAlign     : 'left',
    transition    : 'all 0.15s ease',
    fontFamily    : 'inherit',
  },
  cardTop : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '4px',
  },
  cardIcon : {
    fontSize : '12px',
  },
  cardLabel : {
    fontSize   : '13px',
    fontWeight : '800',
  },
  cardFull : {
    fontSize : '10px',
    color    : '#88C0D0',
  },
  cardSub : {
    fontSize   : '9px',
    color      : '#6B7A8D',
    lineHeight : '1.3',
    marginTop  : '1px',
  },
};