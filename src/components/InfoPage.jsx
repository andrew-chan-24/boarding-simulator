import React, { useState } from 'react';
import { PASSENGER_TYPES, METHOD_COLOURS, AIRCRAFT } from '../simulation/constants';

// ─────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div style={sectionStyles.container}>
      <div style={sectionStyles.header}>
        <span style={sectionStyles.icon}>{icon}</span>
        <h2 style={sectionStyles.title}>{title}</h2>
      </div>
      <div style={sectionStyles.body}>{children}</div>
    </div>
  );
}

const sectionStyles = {
  container : {
    background   : '#3B4252',
    borderRadius : '12px',
    border       : '1px solid #4C566A',
    overflow     : 'hidden',
    marginBottom : '20px',
  },
  header : {
    display      : 'flex',
    alignItems   : 'center',
    gap          : '12px',
    padding      : '16px 24px',
    borderBottom : '1px solid #4C566A',
    background   : '#2E344088',
  },
  icon : {
    fontSize : '22px',
  },
  title : {
    margin     : 0,
    fontSize   : '16px',
    fontWeight : 'bold',
    color      : '#88C0D0',
  },
  body : {
    padding : '20px 24px',
  },
};

// ── Stat card ─────────────────────────────────
function StatCard({ value, label, colour, icon }) {
  return (
    <div style={{
      ...cardStyles.container,
      borderColor : colour || '#4C566A',
      boxShadow   : `0 0 12px ${colour || '#4C566A'}22`,
    }}>
      <div style={cardStyles.icon}>{icon}</div>
      <div style={{ ...cardStyles.value, color: colour || '#ECEFF4' }}>{value}</div>
      <div style={cardStyles.label}>{label}</div>
    </div>
  );
}

const cardStyles = {
  container : {
    background   : '#2E3440',
    borderRadius : '10px',
    border       : '1px solid',
    padding      : '16px 12px',
    textAlign    : 'center',
    flex         : 1,
    minWidth     : '100px',
  },
  icon : {
    fontSize     : '24px',
    marginBottom : '6px',
  },
  value : {
    fontSize   : '22px',
    fontWeight : 'bold',
    lineHeight : 1,
  },
  label : {
    color      : '#6B7A8D',
    fontSize   : '11px',
    marginTop  : '4px',
    lineHeight : '1.3',
  },
};

// ── Method card ───────────────────────────────
function MethodCard({ name, colour, description, speed, detail }) {
  const [expanded, setExpanded] = useState(false);
  const bars = Math.round(speed * 5);
  return (
    <div style={{
      ...methodStyles.card,
      borderColor : colour,
    }}>
      <div style={methodStyles.top}>
        <div style={methodStyles.nameRow}>
          <span style={{ ...methodStyles.dot, background: colour }} />
          <span style={{ ...methodStyles.name, color: colour }}>{name}</span>
        </div>
        <div style={methodStyles.speedRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                ...methodStyles.speedBar,
                background : i < bars ? colour : '#434C5E',
              }}
            />
          ))}
          <span style={{ ...methodStyles.speedLabel, color: colour }}>
            {['Very Slow', 'Slow', 'Medium', 'Fast', 'Fastest'][Math.round(speed * 4)]}
          </span>
        </div>
      </div>
      <p style={methodStyles.desc}>{description}</p>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ ...methodStyles.toggle, color: colour }}
      >
        {expanded ? '▲ Less detail' : '▼ More detail'}
      </button>
      {expanded && (
        <div style={methodStyles.detail}>{detail}</div>
      )}
    </div>
  );
}

const methodStyles = {
  card : {
    background   : '#2E3440',
    borderRadius : '8px',
    border       : '1px solid',
    padding      : '14px 16px',
  },
  top : {
    display        : 'flex',
    justifyContent : 'space-between',
    alignItems     : 'flex-start',
    marginBottom   : '8px',
    flexWrap       : 'wrap',
    gap            : '6px',
  },
  nameRow : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '8px',
  },
  dot : {
    width        : '10px',
    height       : '10px',
    borderRadius : '50%',
    flexShrink   : 0,
  },
  name : {
    fontSize   : '14px',
    fontWeight : 'bold',
  },
  speedRow : {
    display    : 'flex',
    alignItems : 'center',
    gap        : '3px',
  },
  speedBar : {
    width        : '10px',
    height       : '10px',
    borderRadius : '2px',
  },
  speedLabel : {
    fontSize   : '10px',
    fontWeight : '600',
    marginLeft : '4px',
  },
  desc : {
    color      : '#A0AABB',
    fontSize   : '12px',
    lineHeight : '1.6',
    margin     : '0 0 8px',
  },
  toggle : {
    background  : 'transparent',
    border      : 'none',
    cursor      : 'pointer',
    fontSize    : '11px',
    fontFamily  : 'inherit',
    padding     : '0',
    fontWeight  : '600',
  },
  detail : {
    marginTop  : '10px',
    color      : '#88C0D0',
    fontSize   : '12px',
    lineHeight : '1.7',
    borderTop  : '1px solid #4C566A',
    paddingTop : '10px',
  },
};

// ── Passenger type card ───────────────────────
function PassengerCard({ type, info }) {
  const barWidth = (info.luggage / 6) * 100;
  return (
    <div style={paxStyles.card}>
      <div style={paxStyles.top}>
        <span style={paxStyles.icon}>{info.icon}</span>
        <div>
          <div style={{ ...paxStyles.name, color: info.colour }}>{info.label}</div>
          <div style={paxStyles.sub}>Stow time: {info.luggage} steps</div>
        </div>
      </div>
      <div style={paxStyles.barTrack}>
        <div style={{
          ...paxStyles.barFill,
          width      : `${barWidth}%`,
          background : info.colour,
        }} />
      </div>
    </div>
  );
}

const paxStyles = {
  card : {
    background   : '#2E3440',
    borderRadius : '8px',
    border       : '1px solid #4C566A',
    padding      : '12px 14px',
  },
  top : {
    display      : 'flex',
    alignItems   : 'center',
    gap          : '10px',
    marginBottom : '10px',
  },
  icon : {
    fontSize : '24px',
  },
  name : {
    fontSize   : '13px',
    fontWeight : 'bold',
  },
  sub : {
    color    : '#6B7A8D',
    fontSize : '11px',
    marginTop: '2px',
  },
  barTrack : {
    background   : '#3B4252',
    borderRadius : '4px',
    height       : '8px',
    overflow     : 'hidden',
  },
  barFill : {
    height       : '100%',
    borderRadius : '4px',
  },
};

// ── Aircraft row ──────────────────────────────
function AircraftRow({ id, ac }) {
  const totalSeats = ac.rows * ac.layout.reduce((a, b) => a + b, 0);
  const layoutStr  = ac.layout.join(' – ');
  return (
    <div style={acStyles.row}>
      <div style={acStyles.icon}>{ac.icon}</div>
      <div style={acStyles.info}>
        <div style={acStyles.name}>{ac.label}
          <span style={acStyles.id}> ({id})</span>
        </div>
        <div style={acStyles.sub}>{ac.description}</div>
      </div>
      <div style={acStyles.stats}>
        <div style={acStyles.stat}>
          <span style={acStyles.statVal}>{ac.rows}</span>
          <span style={acStyles.statLabel}>rows</span>
        </div>
        <div style={acStyles.stat}>
          <span style={acStyles.statVal}>{layoutStr}</span>
          <span style={acStyles.statLabel}>layout</span>
        </div>
        <div style={acStyles.stat}>
          <span style={acStyles.statVal}>{totalSeats}</span>
          <span style={acStyles.statLabel}>seats</span>
        </div>
        <div style={acStyles.stat}>
          <span style={acStyles.statVal}>{ac.aisles}</span>
          <span style={acStyles.statLabel}>aisle{ac.aisles > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

const acStyles = {
  row : {
    display      : 'flex',
    alignItems   : 'center',
    gap          : '14px',
    padding      : '12px 0',
    borderBottom : '1px solid #4C566A33',
    flexWrap     : 'wrap',
  },
  icon : {
    fontSize : '20px',
    minWidth : '28px',
  },
  info : {
    flex : 1,
    minWidth: '160px',
  },
  name : {
    fontSize   : '13px',
    fontWeight : 'bold',
    color      : '#ECEFF4',
  },
  id : {
    color      : '#6B7A8D',
    fontWeight : 'normal',
    fontSize   : '12px',
  },
  sub : {
    color    : '#6B7A8D',
    fontSize : '11px',
    marginTop: '2px',
  },
  stats : {
    display : 'flex',
    gap     : '12px',
  },
  stat : {
    display       : 'flex',
    flexDirection : 'column',
    alignItems    : 'center',
    minWidth      : '40px',
  },
  statVal : {
    fontSize   : '13px',
    fontWeight : 'bold',
    color      : '#88C0D0',
  },
  statLabel : {
    fontSize : '9px',
    color    : '#6B7A8D',
    marginTop: '1px',
  },
};

// ── Timeline step ─────────────────────────────
function TimelineStep({ step, title, description, colour }) {
  return (
    <div style={timelineStyles.row}>
      <div style={timelineStyles.left}>
        <div style={{
          ...timelineStyles.circle,
          background  : colour,
          boxShadow   : `0 0 10px ${colour}66`,
        }}>
          {step}
        </div>
        <div style={timelineStyles.line} />
      </div>
      <div style={timelineStyles.content}>
        <div style={{ ...timelineStyles.title, color: colour }}>{title}</div>
        <div style={timelineStyles.desc}>{description}</div>
      </div>
    </div>
  );
}

const timelineStyles = {
  row : {
    display : 'flex',
    gap     : '16px',
  },
  left : {
    display       : 'flex',
    flexDirection : 'column',
    alignItems    : 'center',
    flexShrink    : 0,
  },
  circle : {
    width        : '28px',
    height       : '28px',
    borderRadius : '50%',
    display      : 'flex',
    alignItems   : 'center',
    justifyContent: 'center',
    fontSize     : '12px',
    fontWeight   : 'bold',
    color        : '#2E3440',
    flexShrink   : 0,
  },
  line : {
    width      : '2px',
    flex       : 1,
    background : '#4C566A',
    margin     : '4px 0',
    minHeight  : '16px',
  },
  content : {
    paddingBottom : '20px',
    flex          : 1,
  },
  title : {
    fontSize   : '13px',
    fontWeight : 'bold',
    marginBottom: '4px',
  },
  desc : {
    color      : '#A0AABB',
    fontSize   : '12px',
    lineHeight : '1.6',
  },
};

// ── Tech badge ────────────────────────────────
function TechBadge({ name, colour, description }) {
  return (
    <div style={{
      ...techStyles.badge,
      borderColor : colour,
      background  : colour + '11',
    }}>
      <div style={{ ...techStyles.name, color: colour }}>{name}</div>
      <div style={techStyles.desc}>{description}</div>
    </div>
  );
}

const techStyles = {
  badge : {
    borderRadius : '8px',
    border       : '1px solid',
    padding      : '10px 14px',
  },
  name : {
    fontSize   : '13px',
    fontWeight : 'bold',
    marginBottom: '4px',
  },
  desc : {
    color    : '#A0AABB',
    fontSize : '11px',
    lineHeight: '1.5',
  },
};

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const METHODS_INFO = [
  {
    name        : 'Random',
    colour      : METHOD_COLOURS['Random'],
    speed       : 0.5,
    description : 'Passengers board in a completely random order with no organisation. Surprisingly, this often outperforms back-to-front boarding because it naturally distributes passengers along the aisle.',
    detail      : 'In random boarding, passengers are shuffled before entering. Because they are spread across all rows, there is less chance of a long queue forming behind a single slow passenger. Research by Steffen (2008) showed random boarding is significantly faster than the back-to-front method used by most airlines.',
  },
  {
    name        : 'Back-to-Front',
    colour      : METHOD_COLOURS['Back-to-Front'],
    speed       : 0.25,
    description : 'The cabin is divided into zones. Rear zones board first, progressively moving forward. This is the most commonly used method by commercial airlines despite being one of the slowest.',
    detail      : 'Back-to-front is intuitive — fill the back first so front passengers do not block the aisle. However, in practice it creates dense clusters of passengers in each zone, causing severe aisle congestion. Every passenger in a zone must stow luggage before the next zone can board, creating a sequential bottleneck.',
  },
  {
    name        : 'Front-to-Back',
    colour      : METHOD_COLOURS['Front-to-Back'],
    speed       : 0.1,
    description : 'Front zones board first. This is almost universally the worst method as every passenger must walk past already-seated passengers, creating maximum aisle interference.',
    detail      : 'Front-to-back is the worst theoretical boarding strategy. Every passenger who boards must walk past all previously seated passengers to reach their row. This creates a continuous queue stretching from the door to the back of the plane. It is included here as a baseline for comparison.',
  },
  {
    name        : 'WILMA',
    colour      : METHOD_COLOURS['WILMA'],
    speed       : 0.75,
    description : 'Window seats board first across all rows, then middle seats, then aisle seats. This eliminates the most common source of delay — passengers climbing over each other within a row.',
    detail      : 'WILMA (Window-Middle-Aisle) addresses the within-row interference problem. When an aisle seat passenger is already seated and a window seat passenger arrives for the same row, the aisle passenger must stand up and move. WILMA eliminates this entirely. It is faster than back-to-front but slower than Steffen because it still allows aisle congestion between rows.',
  },
  {
    name        : 'Steffen',
    colour      : METHOD_COLOURS['Steffen'],
    speed       : 1.0,
    description : 'The mathematically optimal boarding method, developed by astrophysicist Jason Steffen in 2008. Window seats board in alternating rows back-to-front, eliminating all aisle interference.',
    detail      : 'The Steffen method works by ensuring no two consecutive passengers in the boarding queue are ever in adjacent rows. This means multiple passengers can stow luggage simultaneously without blocking each other. The order is: left window even rows → left window odd rows → right window even rows → right window odd rows → then middle seats → then aisle seats. In studies it was found to be 2× faster than back-to-front and 20–30% faster than random boarding.',
  },
  {
    name        : "Andrew's Method",
    colour      : METHOD_COLOURS["Andrew's Method"],
    speed       : 0.05,
    description : 'Boards in strict ascending seat number order — 1A, 1B, 1C... through to the last seat. A theoretical worst-case scenario that demonstrates the impact of front-loading the aisle.',
    detail      : "Andrew's Method boards every seat in row 1 before moving to row 2, and so on. This guarantees maximum aisle congestion — every passenger must wait for all passengers ahead of them to be fully seated before they can reach their row. It performs similarly to front-to-back but is even more extreme because it fills each row completely before advancing.",
  },
];

const TECH_STACK = [
  {
    name        : 'React 18',
    colour      : '#61DAFB',
    description : 'Component-based UI framework. Manages all application state, user interactions, and component lifecycle.',
  },
  {
    name        : 'Vite',
    colour      : '#A78BFA',
    description : 'Next-generation build tool. Provides instant hot module replacement and fast production builds with zero deprecated dependencies.',
  },
  {
    name        : 'HTML5 Canvas',
    colour      : '#F97316',
    description : 'Used for the cabin animation. Renders 60fps animations of 100–420 passengers without any DOM overhead.',
  },
  {
    name        : 'D3.js',
    colour      : '#F59E0B',
    description : 'Data-driven SVG charts. Powers the comparison bar chart with scales, axes, error bars and smooth transitions.',
  },
  {
    name        : 'requestAnimationFrame',
    colour      : '#34D399',
    description : 'Browser-native animation loop. Drives the simulation tick at the display refresh rate for smooth, efficient animation.',
  },
  {
    name        : 'ES Modules',
    colour      : '#88C0D0',
    description : 'All simulation logic is written as pure JavaScript ES modules with no framework dependency, making it fully portable.',
  },
];

const SIMULATION_STEPS = [
  {
    step        : 1,
    title       : 'Generate Boarding Order',
    colour      : '#5E81AC',
    description : 'The selected boarding method generates an ordered array of {row, seat} objects representing the sequence passengers will board. Methods like Steffen apply complex sorting; Random simply shuffles.',
  },
  {
    step        : 2,
    title       : 'Assign Passenger Types',
    colour      : '#A3BE8C',
    description : 'Each position in the boarding queue is assigned a passenger type (male, female, elderly, child) based on the configured composition percentages. Types are randomly distributed within the queue.',
  },
  {
    step        : 3,
    title       : 'Admit One Passenger Per Tick',
    colour      : '#EBCB8B',
    description : 'Each simulation step admits exactly one new passenger through the single cabin door. If the door row is occupied, nobody enters that tick — modelling the real jetbridge queue bottleneck.',
  },
  {
    step        : 4,
    title       : 'Process Aisle Back-to-Front',
    colour      : '#D08770',
    description : 'Every passenger already in the aisle is processed from the back row forward. This ordering prevents passengers from overwriting each other in the same tick. Each passenger either walks, stows, waits, or sits.',
  },
  {
    step        : 5,
    title       : 'Type-Specific Luggage Stowing',
    colour      : '#BF616A',
    description : 'When a passenger reaches their target row they begin stowing luggage. The duration depends on their type: children (2 steps), males (3), females (4), elderly (6). During this time they block the aisle.',
  },
  {
    step        : 6,
    title       : 'Completion Detection',
    colour      : '#B48EAD',
    description : 'After each tick the seated count is compared to the total passenger count. When they match, the simulation is marked done and the animation loop stops. The step count is the boarding time metric.',
  },
];

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
export default function InfoPage() {
  const totalAircraft  = Object.keys(AIRCRAFT).length;
  const totalMethods   = Object.keys(METHOD_COLOURS).length;
  const totalPaxTypes  = Object.keys(PASSENGER_TYPES).length;
  const maxSeats       = Math.max(
    ...Object.values(AIRCRAFT).map(a => a.rows * a.layout.reduce((x, y) => x + y, 0))
  );

  return (
    <div style={styles.page}>
      <div style={styles.content}>

        {/* ── Hero ── */}
        <div style={styles.hero}>
          <div style={styles.heroIcon}>✈</div>
          <h1 style={styles.heroTitle}>Airplane Boarding Simulator</h1>
          <p style={styles.heroSub}>
            An interactive, physics-inspired simulation exploring how different
            boarding strategies affect the time it takes to fill a commercial aircraft.
            Built with React, Canvas and D3.
          </p>
          <div style={styles.heroStats}>
            <StatCard value={totalMethods}  label="Boarding Methods"  colour="#5E81AC" icon="📋" />
            <StatCard value={totalAircraft} label="Aircraft Types"    colour="#A3BE8C" icon="✈"  />
            <StatCard value={totalPaxTypes} label="Passenger Types"   colour="#B48EAD" icon="👥" />
            <StatCard value={maxSeats}      label="Max Cabin Size"    colour="#EBCB8B" icon="💺" />
          </div>
        </div>

        {/* ── What is this ── */}
        <Section title="What Is This?" icon="🎯">
          <p style={styles.para}>
            Airplane boarding is a surprisingly complex optimisation problem. Airlines
            lose significant revenue every minute a plane sits at the gate, yet most
            still use boarding strategies that were developed decades ago with little
            scientific basis.
          </p>
          <p style={styles.para}>
            This simulator models the boarding process as a discrete-time simulation
            where each "step" represents one unit of time. Passengers move through
            the aisle, stow their luggage, and take their seats — all subject to
            realistic constraints like aisle blocking and variable luggage times.
          </p>
          <p style={styles.para}>
            The goal is to make it visually intuitive <em>why</em> some methods
            are faster than others — not just show that they are.
          </p>
        </Section>

        {/* ── How the simulation works ── */}
        <Section title="How the Simulation Works" icon="⚙️">
          <p style={{ ...styles.para, marginBottom: '20px' }}>
            Each simulation tick runs through six phases. The entire cabin state
            is updated atomically — every passenger moves simultaneously:
          </p>
          <div style={styles.timeline}>
            {SIMULATION_STEPS.map((s, i) => (
              <TimelineStep
                key={s.step}
                {...s}
                // Hide the line on the last step
                style={i === SIMULATION_STEPS.length - 1 ? { lineHeight: 0 } : {}}
              />
            ))}
          </div>
        </Section>

        {/* ── Boarding methods ── */}
        <Section title="Boarding Methods" icon="📋">
          <p style={{ ...styles.para, marginBottom: '16px' }}>
            Six boarding strategies are implemented. The speed rating (1–5 bars)
            reflects relative performance based on simulation results and published
            research. Click "More detail" on any method to learn how it works.
          </p>
          <div style={styles.methodGrid}>
            {METHODS_INFO.map(m => (
              <MethodCard key={m.name} {...m} />
            ))}
          </div>
        </Section>

        {/* ── Passenger types ── */}
        <Section title="Passenger Types" icon="👥">
          <p style={{ ...styles.para, marginBottom: '16px' }}>
            Each passenger is assigned a type that determines how long they take
            to stow their luggage. This is the primary source of aisle blocking
            in the simulation. The composition can be configured before each run.
          </p>
          <div style={styles.paxGrid}>
            {Object.entries(PASSENGER_TYPES).map(([key, info]) => (
              <PassengerCard key={key} type={key} info={info} />
            ))}
          </div>
          <div style={styles.callout}>
            <span style={styles.calloutIcon}>💡</span>
            <span style={styles.calloutText}>
              Try running the comparison with 100% elderly passengers vs 100% children
              to see how dramatically luggage time affects total boarding duration —
              even when using the same boarding method.
            </span>
          </div>
        </Section>

        {/* ── Aircraft types ── */}
        <Section title="Aircraft Types" icon="🛫">
          <p style={{ ...styles.para, marginBottom: '16px' }}>
            Six aircraft are modelled across two categories. Narrow-body aircraft
            have a single aisle; wide-body aircraft have two aisles. The twin-aisle
            layout introduces interesting dynamics — passengers are assigned to their
            nearest aisle, but only one passenger can enter the plane per tick
            regardless of aisle count.
          </p>
          <div>
            {Object.entries(AIRCRAFT).map(([id, ac]) => (
              <AircraftRow key={id} id={id} ac={ac} />
            ))}
          </div>
          <div style={styles.callout}>
            <span style={styles.calloutIcon}>💡</span>
            <span style={styles.calloutText}>
              Despite having two aisles, wide-body aircraft do not board twice as fast.
              The single door bottleneck means the second aisle only helps once
              passengers have spread far enough back to use both aisles simultaneously.
            </span>
          </div>
        </Section>

        {/* ── Tech stack ── */}
        <Section title="Technology Stack" icon="🛠️">
          <p style={{ ...styles.para, marginBottom: '16px' }}>
            The project is built entirely in the browser with no backend.
            The simulation engine is pure JavaScript and the rendering uses
            native browser APIs for maximum performance.
          </p>
          <div style={styles.techGrid}>
            {TECH_STACK.map(t => (
              <TechBadge key={t.name} {...t} />
            ))}
          </div>
        </Section>

        {/* ── Architecture ── */}
        <Section title="Code Architecture" icon="🗂️">
          <p style={{ ...styles.para, marginBottom: '16px' }}>
            The codebase is split into three layers with a strict separation of concerns:
          </p>
          <div style={styles.archGrid}>
            {[
              {
                layer   : 'Simulation Layer',
                colour  : '#5E81AC',
                icon    : '⚙️',
                files   : ['constants.js', 'boardingOrders.js', 'boardingSim.js'],
                desc    : 'Pure JavaScript with no React dependency. Can be run in Node.js, a Web Worker, or any JS environment. Contains all boarding logic, passenger types, and aircraft definitions.',
              },
              {
                layer   : 'Hook Layer',
                colour  : '#A3BE8C',
                icon    : '🪝',
                files   : ['useSimulation.js', 'useAnimationLoop.js'],
                desc    : 'React hooks that bridge the simulation engine and the UI. Manage simulation state, animation frame timing, and expose clean control functions to components.',
              },
              {
                layer   : 'Component Layer',
                colour  : '#EBCB8B',
                icon    : '🧩',
                files   : ['App.jsx', 'CabinCanvas.jsx', 'StatsPanel.jsx', 'ComparisonChart.jsx', '...'],
                desc    : 'React components responsible only for rendering and user interaction. Components never touch simulation state directly — they only call hook functions.',
              },
            ].map(({ layer, colour, icon, files, desc }) => (
              <div key={layer} style={{
                ...archStyles.card,
                borderColor : colour,
              }}>
                <div style={archStyles.cardHeader}>
                  <span style={archStyles.cardIcon}>{icon}</span>
                  <span style={{ ...archStyles.cardTitle, color: colour }}>{layer}</span>
                </div>
                <div style={archStyles.files}>
                  {files.map(f => (
                    <code key={f} style={{
                      ...archStyles.file,
                      borderColor : colour + '44',
                      color       : colour,
                    }}>
                      {f}
                    </code>
                  ))}
                </div>
                <p style={archStyles.desc}>{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── References ── */}
        <Section title="References & Further Reading" icon="📚">
          <div style={styles.refList}>
            {[
              {
                author : 'Steffen, J.H. (2008)',
                title  : 'Optimal boarding method for airline passengers',
                journal: 'Journal of Air Transport Management, 14(3), 146–150',
                colour : '#5E81AC',
              },
              {
                author : 'Steffen, J.H. & Hotchkiss, J. (2012)',
                title  : 'Experimental test of airplane boarding methods',
                journal: 'Journal of Air Transport Management, 18(1), 64–67',
                colour : '#A3BE8C',
              },
              {
                author : 'Bazargan, M. (2007)',
                title  : 'A linear programming approach for aircraft boarding strategy',
                journal: 'European Journal of Operational Research, 183(1), 394–411',
                colour : '#EBCB8B',
              },
              {
                author : 'Ferrari, P. & Nagel, K. (2005)',
                title  : 'Robustness of efficient passenger boarding strategies for airplanes',
                journal: 'Transportation Research Record, 1915(1), 44–54',
                colour : '#B48EAD',
              },
            ].map(ref => (
              <div key={ref.author} style={{
                ...refStyles.item,
                borderLeftColor : ref.colour,
              }}>
                <div style={{ ...refStyles.author, color: ref.colour }}>{ref.author}</div>
                <div style={refStyles.title}>{ref.title}</div>
                <div style={refStyles.journal}>{ref.journal}</div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}

const styles = {
  page : {
    minHeight  : '100vh',
    background : '#2E3440',
    color      : '#ECEFF4',
  },
  content : {
    maxWidth : '860px',
    margin   : '0 auto',
    padding  : '32px 20px 60px',
  },
  hero : {
    textAlign    : 'center',
    marginBottom : '32px',
    padding      : '32px 20px',
    background   : '#3B4252',
    borderRadius : '12px',
    border       : '1px solid #4C566A',
  },
  heroIcon : {
    fontSize     : '48px',
    marginBottom : '12px',
  },
  heroTitle : {
    margin     : '0 0 12px',
    fontSize   : '26px',
    fontWeight : 'bold',
    color      : '#88C0D0',
  },
  heroSub : {
    color      : '#A0AABB',
    fontSize   : '14px',
    lineHeight : '1.7',
    maxWidth   : '600px',
    margin     : '0 auto 24px',
  },
  heroStats : {
    display        : 'flex',
    justifyContent : 'center',
    gap            : '12px',
    flexWrap       : 'wrap',
  },
  para : {
    color      : '#A0AABB',
    fontSize   : '13px',
    lineHeight : '1.8',
    margin     : '0 0 12px',
  },
  timeline : {
    paddingLeft : '4px',
  },
  methodGrid : {
    display             : 'grid',
    gridTemplateColumns : 'repeat(auto-fill, minmax(340px, 1fr))',
    gap                 : '12px',
  },
  paxGrid : {
    display             : 'grid',
    gridTemplateColumns : 'repeat(auto-fill, minmax(180px, 1fr))',
    gap                 : '10px',
    marginBottom        : '14px',
  },
  callout : {
    display      : 'flex',
    alignItems   : 'flex-start',
    gap          : '10px',
    background   : '#2E3440',
    borderRadius : '8px',
    border       : '1px solid #4C566A',
    padding      : '12px 14px',
    marginTop    : '4px',
  },
  calloutIcon : {
    fontSize  : '16px',
    flexShrink: 0,
    marginTop : '1px',
  },
  calloutText : {
    color      : '#88C0D0',
    fontSize   : '12px',
    lineHeight : '1.6',
  },
  techGrid : {
    display             : 'grid',
    gridTemplateColumns : 'repeat(auto-fill, minmax(220px, 1fr))',
    gap                 : '10px',
  },
  archGrid : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '12px',
  },
  refList : {
    display       : 'flex',
    flexDirection : 'column',
    gap           : '12px',
  },
};

const archStyles = {
  card : {
    background   : '#2E3440',
    borderRadius : '8px',
    border       : '1px solid',
    padding      : '14px 16px',
  },
  cardHeader : {
    display      : 'flex',
    alignItems   : 'center',
    gap          : '8px',
    marginBottom : '10px',
  },
  cardIcon : {
    fontSize : '16px',
  },
  cardTitle : {
    fontSize   : '14px',
    fontWeight : 'bold',
  },
  files : {
    display  : 'flex',
    flexWrap : 'wrap',
    gap      : '6px',
    marginBottom: '10px',
  },
  file : {
    fontSize     : '11px',
    padding      : '2px 8px',
    borderRadius : '4px',
    border       : '1px solid',
    background   : '#3B425233',
    fontFamily   : 'monospace',
  },
  desc : {
    color      : '#A0AABB',
    fontSize   : '12px',
    lineHeight : '1.6',
    margin     : 0,
  },
};

const refStyles = {
  item : {
    borderLeft  : '3px solid',
    paddingLeft : '14px',
    paddingTop  : '2px',
  },
  author : {
    fontSize   : '12px',
    fontWeight : 'bold',
    marginBottom: '2px',
  },
  title : {
    color      : '#ECEFF4',
    fontSize   : '13px',
    marginBottom: '2px',
  },
  journal : {
    color    : '#6B7A8D',
    fontSize : '11px',
    fontStyle: 'italic',
  },
};