# ✈ Airplane Boarding Simulator

An interactive, browser-based simulation that visualises and compares different
airplane boarding strategies in real time.

Built with **React**, **HTML5 Canvas** and **D3.js**.

🌐 **[Live Demo](https://YOUR_USERNAME.github.io/airplane-boarding)**

---

## What It Does

Simulates passengers boarding a commercial aircraft and measures how long each
boarding method takes. Every passenger moves through the aisle, stows their
luggage, and takes their seat — subject to realistic aisle blocking and
variable luggage times based on passenger type.

---

## Boarding Methods

| Method | Description |
|---|---|
| **Random** | Passengers board in a shuffled order |
| **Back-to-Front** | Rear zones board first — common in real airlines |
| **Front-to-Back** | Front zones board first — typically the slowest |
| **WILMA** | Window → Middle → Aisle, eliminating within-row interference |
| **Steffen** | Mathematically optimal — alternating rows, window seats first |
| **Andrew's Method** | Strict ascending seat order — a theoretical worst case |

---

## Features

- 🎬 **Live cabin animation** — colour-coded passengers moving in real time
- ⏮ **Step forward / back** — inspect the simulation one tick at a time
- 🛫 **6 aircraft types** — A320, A321, B737, A350, B777, B747
- 👥 **4 passenger types** — male, female, elderly, child with different luggage times
- 📊 **Comparison chart** — run all methods head-to-head with D3 bar charts
- ⚡ **Adjustable speed** — from slow-motion to fast-forward
- ℹ️ **Info page** — methodology, references and architecture explained

---

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/airplane-boarding.git
cd airplane-boarding
npm install
npm run dev