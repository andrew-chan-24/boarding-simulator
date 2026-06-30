import React, { useEffect, useRef, useState } from 'react';
import * as d3                   from 'd3';
import { BOARDING_METHODS }      from '../simulation/boardingOrders';
import { BoardingSim }           from '../simulation/boardingSim';
import {
  METHOD_COLOURS,
  AIRCRAFT,
  DEFAULT_AIRCRAFT,
  DEFAULT_COMPOSITION,
  PASSENGER_TYPES,
} from '../simulation/constants';
import CompositionSelector from './CompositionSelector';

const TRIALS = 8;

function runComparison(aircraftKey, composition) {
  const aircraft = AIRCRAFT[aircraftKey];
  const results  = {};
  for (const [name, fn] of Object.entries(BOARDING_METHODS)) {
    const steps = [];
    for (let t = 0; t < TRIALS; t++) {
      const sim = new BoardingSim(fn(aircraft), aircraft, composition);
      steps.push(sim.runToEnd());
    }
    results[name] = {
      mean : d3.mean(steps),
      std  : d3.deviation(steps),
      min  : d3.min(steps),
      max  : d3.max(steps),
    };
  }
  return results;
}

// ─────────────────────────────────────────────
//  COMPOSITION SUMMARY  (small read-only display)
// ─────────────────────────────────────────────
function CompositionSummary({ composition }) {
  return (
    <div style={summaryStyles.container}>
      {Object.entries(PASSENGER_TYPES).map(([key, pt]) => (
        <div key={key} style={summaryStyles.item}>
          <span style={summaryStyles.icon}>{pt.icon}</span>
          <div style={summaryStyles.barTrack}>
            <div style={{
              ...summaryStyles.barFill,
              width      : `${composition[key] || 0}%`,
              background : pt.colour,
            }} />
          </div>
          <span style={{ ...summaryStyles.label, color: pt.colour }}>
            {composition[key] || 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

const summaryStyles = {
  container : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '4px',
    background    : '#2E3440',
    borderRadius  : '6px',
    padding       : '8px 10px',
    marginBottom  : '12px',
  },
  item : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '6px',
  },
  icon : {
    fontSize : '13px',
    minWidth : '20px',
  },
  barTrack : {
    flex         : 1,
    background   : '#3B4252',
    borderRadius : '3px',
    height       : '6px',
    overflow     : 'hidden',
  },
  barFill : {
    height       : '100%',
    borderRadius : '3px',
  },
  label : {
    fontSize  : '11px',
    minWidth  : '32px',
    textAlign : 'right',
  },
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ComparisonChart() {
  const svgRef        = useRef(null);
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [aircraftKey, setAircraftKey] = useState(DEFAULT_AIRCRAFT);
  const [composition, setComposition] = useState({ ...DEFAULT_COMPOSITION });
  const [openPanel,   setOpenPanel]   = useState(null);

  // Track what composition was used for the last run
  // so the chart annotation is always accurate
  const [lastRunMeta, setLastRunMeta] = useState(null);

  const compositionValid =
    Object.values(composition).reduce((a, b) => a + b, 0) === 100;

  const handleRun = () => {
    if (!compositionValid) return;
    setLoading(true);
    setTimeout(() => {
      setData(runComparison(aircraftKey, composition));
      setLastRunMeta({ aircraftKey, composition: { ...composition } });
      setLoading(false);
    }, 50);
  };

  // Reset chart when aircraft or composition changes
  const handleAircraftChange = (key) => {
    setAircraftKey(key);
    setData(null);
    setLastRunMeta(null);
  };

  const handleCompositionChange = (newComp) => {
    setComposition(newComp);
    setData(null);       // invalidate old chart when composition changes
    setLastRunMeta(null);
  };

  // ── D3 chart ───────────────────────────────
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const margin = { top: 40, right: 30, bottom: 60, left: 65 };
    const W      = svgRef.current.clientWidth || 500;
    const H      = 320;
    const width  = W - margin.left - margin.right;
    const height = H - margin.top  - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('height', H)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort descending by mean (slowest → fastest left → right)
    const names  = Object.keys(data).sort((a, b) => data[b].mean - data[a].mean);
    const means  = names.map(n => data[n].mean);
    const maxVal = d3.max(names, n => data[n].max);

    const x = d3.scaleBand().domain(names).range([0, width]).padding(0.3);
    const y = d3.scaleLinear().domain([0, maxVal * 1.15]).range([height, 0]);

    // Grid lines
    svg.append('g')
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#4C566A')
      .attr('stroke-dasharray', '3,3');
    svg.select('.domain').remove();

    // Bars
    svg.selectAll('.bar')
      .data(names).join('rect')
      .attr('class', 'bar')
      .attr('x',      n => x(n))
      .attr('y',      n => y(data[n].mean))
      .attr('width',  x.bandwidth())
      .attr('height', n => height - y(data[n].mean))
      .attr('fill',   n => METHOD_COLOURS[n])
      .attr('rx', 4);

    // Error bars
    svg.selectAll('.err')
      .data(names).join('line')
      .attr('class', 'err')
      .attr('x1', n => x(n) + x.bandwidth() / 2)
      .attr('x2', n => x(n) + x.bandwidth() / 2)
      .attr('y1', n => y(data[n].mean - (data[n].std || 0)))
      .attr('y2', n => y(data[n].mean + (data[n].std || 0)))
      .attr('stroke', '#ECEFF4')
      .attr('stroke-width', 2);

    // Error bar caps
    svg.selectAll('.cap-top')
      .data(names).join('line')
      .attr('x1', n => x(n) + x.bandwidth() / 2 - 4)
      .attr('x2', n => x(n) + x.bandwidth() / 2 + 4)
      .attr('y1', n => y(data[n].mean + (data[n].std || 0)))
      .attr('y2', n => y(data[n].mean + (data[n].std || 0)))
      .attr('stroke', '#ECEFF4')
      .attr('stroke-width', 1.5);

    svg.selectAll('.cap-bot')
      .data(names).join('line')
      .attr('x1', n => x(n) + x.bandwidth() / 2 - 4)
      .attr('x2', n => x(n) + x.bandwidth() / 2 + 4)
      .attr('y1', n => y(data[n].mean - (data[n].std || 0)))
      .attr('y2', n => y(data[n].mean - (data[n].std || 0)))
      .attr('stroke', '#ECEFF4')
      .attr('stroke-width', 1.5);

    // Value labels above bars
    svg.selectAll('.val')
      .data(names).join('text')
      .attr('class', 'val')
      .attr('x',           n => x(n) + x.bandwidth() / 2)
      .attr('y',           n => y(data[n].mean) - 8)
      .attr('text-anchor', 'middle')
      .attr('fill',        '#ECEFF4')
      .attr('font-size',   '11px')
      .attr('font-weight', 'bold')
      .text(n => Math.round(data[n].mean));

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill',      '#D8DEE9')
      .attr('font-size', '11px');
    svg.selectAll('.tick line').attr('stroke', '#4C566A');
    svg.selectAll('.domain').attr('stroke', '#4C566A');

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill',      '#A0AABB')
      .attr('font-size', '11px');

    // Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -52).attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill',      '#A0AABB')
      .attr('font-size', '11px')
      .text('Simulation Steps (lower = faster)');

    // Title annotation
    const best  = names[names.length - 1];
    const worst = names[0];
    svg.append('text')
      .attr('x', width / 2).attr('y', -18)
      .attr('text-anchor', 'middle')
      .attr('fill',      '#A3BE8C')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(`🏆 Fastest: ${best}   🐢 Slowest: ${worst}`);

    svg.append('text')
      .attr('x', width / 2).attr('y', -4)
      .attr('text-anchor', 'middle')
      .attr('fill',      '#6B7A8D')
      .attr('font-size', '10px')
      .text(
        `${TRIALS} trials · ${AIRCRAFT[lastRunMeta.aircraftKey].label} · ` +
        Object.entries(lastRunMeta.composition)
          .map(([k, v]) => `${PASSENGER_TYPES[k].icon}${v}%`)
          .join(' ')
      );

  }, [data, lastRunMeta]);

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>📊 Method Comparison</h3>
      <p style={styles.desc}>
        Runs all {Object.keys(BOARDING_METHODS).length} methods {TRIALS} times
        each. Configure aircraft and passenger mix below, then run.
      </p>

      {/* ── Aircraft picker ── */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>🛫 Aircraft</div>
        <div style={styles.acGrid}>
          {Object.entries(AIRCRAFT).map(([key, ac]) => (
            <button
              key={key}
              onClick={() => handleAircraftChange(key)}
              disabled={loading}
              style={{
                ...styles.acBtn,
                backgroundColor : aircraftKey === key ? '#5E81AC22' : '#2E3440',
                borderColor     : aircraftKey === key ? '#5E81AC'   : '#4C566A',
                color           : aircraftKey === key ? '#88C0D0'   : '#A0AABB',
              }}
            >
              <div style={styles.acBtnIcon}>{ac.icon}</div>
              <div style={styles.acBtnLabel}>{key}</div>
              <div style={styles.acBtnSub}>{ac.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Passenger composition ── */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>👥 Passenger Mix</div>
        <CompositionSelector
          composition={composition}
          onChange={handleCompositionChange}
          disabled={loading}
          isOpen={openPanel === 'composition'}
          onToggle={() => setOpenPanel(
            prev => prev === 'composition' ? null : 'composition'
          )}
        />
      </div>

      {/* ── Run button ── */}
      <div style={styles.runRow}>
        <button
          onClick={handleRun}
          disabled={loading || !compositionValid}
          style={{
            ...styles.runBtn,
            opacity: loading || !compositionValid ? 0.5 : 1,
            cursor : loading || !compositionValid ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Running…' : '▶ Run Comparison'}
        </button>
        {!compositionValid && (
          <span style={styles.validWarn}>
            ⚠ Passenger mix must total 100%
          </span>
        )}
      </div>

      {/* ── Chart ── */}
      {data && (
        <>
          <div style={styles.divider} />
          <div style={styles.chartMeta}>
            <span style={styles.chartMetaLabel}>Last run:</span>
            <span style={styles.chartMetaValue}>
              {AIRCRAFT[lastRunMeta.aircraftKey].label}
            </span>
            <CompositionSummary composition={lastRunMeta.composition} />
          </div>
          <svg
            ref={svgRef}
            style={{ width: '100%', overflow: 'visible' }}
          />
        </>
      )}

      {/* ── Empty state ── */}
      {!data && !loading && (
        <div style={styles.emptyState}>
          Configure your settings above and press Run Comparison
        </div>
      )}

    </div>
  );
}

const styles = {
  container : {
    background   : '#3B4252',
    borderRadius : '10px',
    padding      : '20px',
    border       : '1px solid #4C566A',
  },
  heading : {
    color         : '#88C0D0',
    margin        : '0 0 6px',
    fontSize      : '14px',
    fontWeight    : 'bold',
    letterSpacing : '0.05em',
    textTransform : 'uppercase',
  },
  desc : {
    color        : '#A0AABB',
    fontSize     : '12px',
    margin       : '0 0 16px',
    lineHeight   : '1.5',
  },
  section : {
    marginBottom : '14px',
  },
  sectionTitle : {
    color         : '#6B7A8D',
    fontSize      : '11px',
    fontWeight    : '600',
    textTransform : 'uppercase',
    letterSpacing : '0.06em',
    marginBottom  : '8px',
  },
  acGrid : {
    display             : 'grid',
    gridTemplateColumns : 'repeat(3, 1fr)',
    gap                 : '6px',
  },
  acBtn : {
    display       : 'flex',
    flexDirection : 'column',
    alignItems    : 'center',
    padding       : '8px 4px',
    borderRadius  : '6px',
    border        : '1px solid',
    cursor        : 'pointer',
    fontFamily    : 'inherit',
    transition    : 'all 0.15s',
    textAlign     : 'center',
  },
  acBtnIcon : {
    fontSize     : '14px',
    marginBottom : '2px',
  },
  acBtnLabel : {
    fontSize   : '13px',
    fontWeight : '800',
  },
  acBtnSub : {
    fontSize   : '9px',
    color      : '#6B7A8D',
    marginTop  : '1px',
    lineHeight : '1.2',
  },
  runRow : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '12px',
    margin     : '4px 0 0',
  },
  runBtn : {
    background   : '#5E81AC',
    color        : '#ECEFF4',
    border       : 'none',
    borderRadius : '6px',
    padding      : '9px 24px',
    fontSize     : '13px',
    fontWeight   : 'bold',
    fontFamily   : 'inherit',
    transition   : 'opacity 0.2s',
  },
  validWarn : {
    color    : '#BF616A',
    fontSize : '12px',
  },
  divider : {
    borderTop  : '1px solid #4C566A',
    margin     : '16px 0',
  },
  chartMeta : {
    marginBottom : '4px',
  },
  chartMetaLabel : {
    color      : '#6B7A8D',
    fontSize   : '11px',
    marginRight: '6px',
  },
  chartMetaValue : {
    color      : '#88C0D0',
    fontSize   : '11px',
    fontWeight : '600',
    display    : 'block',
    marginBottom: '6px',
  },
  emptyState : {
    textAlign  : 'center',
    color      : '#4C566A',
    fontSize   : '13px',
    padding    : '32px 0',
    fontStyle  : 'italic',
  },
};