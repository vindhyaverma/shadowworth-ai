# ShadowWorth AI

ShadowWorth AI is a behavioral financial intelligence project that estimates invisible financial damage from everyday habits before people realize the cost.

It is not a finance tracker. It is an AI-style future-self simulator for opportunity loss.

## Core Idea

Most finance apps answer: "Where did my money go?"

ShadowWorth AI answers: "Where is my future wealth silently dying?"

The app analyzes behavioral inputs such as scrolling, procrastination, delayed learning, impulse spending, subscriptions, and sleep quality. It then estimates 5-year opportunity loss, maps a financial identity, detects top leaks, and generates a recovery roadmap.

## Features

- Opportunity loss engine for habit-based financial damage
- Future-self simulation with recovered path vs current path
- AI financial identity mapping
- Wealth death timeline with monthly hidden loss
- Digital leakage detection
- Focus and financial momentum gauges
- Copyable insight card for sharing
- Premium responsive dashboard UI

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API for trajectory visualization
- Browser-native model logic with no external runtime dependency

## Model Layer

This version uses a transparent synthetic future model:

- behavioral feature weighting
- opportunity-cost scoring
- earning trajectory simulation
- identity classification
- recommendation generation

Future versions can add LLM reasoning, clustering, screen-time imports, spending-log analysis, time-series forecasting, and personalized recovery agents.

## Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:4173
```

You can also run it without npm:

```bash
python3 -m http.server 4173
```

## GitHub Upload

```bash
git init
git add .
git commit -m "Build ShadowWorth AI dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shadowworth-ai.git
git push -u origin main
```

## Disclaimer

ShadowWorth AI is an educational prototype. Its estimates are model-based projections, not financial advice.
