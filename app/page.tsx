"use client";

import Lenis from "lenis";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Inputs = {
  age: number;
  income: number;
  targetIncome: number;
  screenTime: number;
  learning: number;
  impulse: number;
  subscriptions: number;
  procrastination: number;
  sleep: number;
};

type Projection = {
  currentPath: number;
  optimizedPath: number;
  divergence: number;
  monthlyLeak: number;
  yearlyDrag: number;
  accelerationLoss: number;
  identity: string;
  truth: string;
  currentSeries: number[];
  optimizedSeries: number[];
  leaks: Array<{ label: string; value: number; line: string }>;
};

const initialInputs: Inputs = {
  age: 21,
  income: 35000,
  targetIncome: 140000,
  screenTime: 5.5,
  learning: 1,
  impulse: 6500,
  subscriptions: 1900,
  procrastination: 10,
  sleep: 0.55,
};

const hardDemo: Inputs = {
  age: 22,
  income: 28000,
  targetIncome: 180000,
  screenTime: 7,
  learning: 0.5,
  impulse: 9200,
  subscriptions: 2600,
  procrastination: 16,
  sleep: 0.34,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function shortMoney(value: number) {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)} L`;
  return money(value);
}

function computeProjection(input: Inputs): Projection {
  const income = Math.max(input.income, 1);
  const target = Math.max(input.targetIncome, income);
  const runway = Math.max(30 - input.age, 3);
  const learningDeficit = clamp(3 - input.learning, 0, 3);
  const attentionHours = input.screenTime + input.procrastination * 0.38;
  const sleepDrag = 1 - input.sleep;
  const monthlyAttentionLeak = attentionHours * 28 * (income / 190) * 0.19;
  const monthlySkillDelay = (target - income) * (0.09 + learningDeficit * 0.08 + sleepDrag * 0.08);
  const monthlyCashLeak = input.impulse * 0.72 + input.subscriptions * 0.94;
  const monthlyProcrastinationLeak = input.procrastination * (income / 170) * 4.6;
  const monthlyLeak = monthlyAttentionLeak + monthlySkillDelay + monthlyCashLeak + monthlyProcrastinationLeak;
  const accelerationLoss = clamp(learningDeficit * 11 + input.screenTime * 2.7 + sleepDrag * 12 + input.procrastination * 0.8, 5, 62);
  const optimizedAcceleration = 1 + clamp((target / income - 1) / 5, 0.08, 0.36);
  const currentAcceleration = optimizedAcceleration * (1 - accelerationLoss / 100);
  const currentPath = income * 12 * Math.pow(1 + currentAcceleration, 5);
  const optimizedPath = income * 12 * Math.pow(1 + optimizedAcceleration, 5) + monthlyLeak * 12 * 1.7;
  const divergence = (optimizedPath - currentPath) * Math.max(runway / 6, 1.2);
  const yearlyDrag = monthlyLeak * 12;

  const currentSeries = Array.from({ length: 6 }, (_, year) => {
    const curve = income * 12 * Math.pow(1 + currentAcceleration, year);
    return curve - yearlyDrag * year * 0.42;
  });

  const optimizedSeries = Array.from({ length: 6 }, (_, year) => {
    const curve = income * 12 * Math.pow(1 + optimizedAcceleration, year);
    return curve + yearlyDrag * year * 0.34;
  });

  const leaks = [
    {
      label: "Attention bleed",
      value: monthlyAttentionLeak,
      line: "Your attention is leaving before your ambition can compound.",
    },
    {
      label: "Skill delay",
      value: monthlySkillDelay,
      line: "The largest cost is not spending. It is postponed capability.",
    },
    {
      label: "Impulse residue",
      value: monthlyCashLeak,
      line: "Small emotional purchases are becoming a silent identity tax.",
    },
    {
      label: "Avoidance tax",
      value: monthlyProcrastinationLeak,
      line: "Unfinished work is charging interest against future confidence.",
    },
  ].sort((a, b) => b.value - a.value);

  const identity =
    input.screenTime > 5 && input.learning < 1.5
      ? "Distracted Potential"
      : input.impulse > income * 0.2
        ? "Emotional Spender"
        : input.learning > 2.5 && input.screenTime < 3
          ? "Compounding Self"
          : "Unclaimed Operator";

  const truth =
    accelerationLoss > 42
      ? "Your current pattern is not failing loudly. It is quietly lowering the ceiling."
      : accelerationLoss > 25
        ? "The gap is still reversible, but it has started to learn your routine."
        : "Your trajectory is fragile in a useful way: small corrections still matter.";

  return {
    currentPath,
    optimizedPath,
    divergence,
    monthlyLeak,
    yearlyDrag,
    accelerationLoss,
    identity,
    truth,
    currentSeries,
    optimizedSeries,
    leaks,
  };
}

function DivergenceCanvas({ projection }: { projection: Projection }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const pad = 42;
    const values = [...projection.currentSeries, ...projection.optimizedSeries];
    const min = Math.min(...values) * 0.92;
    const max = Math.max(...values) * 1.08;
    const x = (i: number) => pad + (i / 5) * (width - pad * 2);
    const y = (v: number) => height - pad - ((v - min) / (max - min)) * (height - pad * 2);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#070707";
    ctx.fillRect(0, 0, width, height);

    const fill = ctx.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, "rgba(156, 18, 38, .18)");
    fill.addColorStop(1, "rgba(156, 18, 38, 0)");
    ctx.beginPath();
    projection.optimizedSeries.forEach((point, i) => {
      if (i === 0) ctx.moveTo(x(i), y(point));
      else ctx.lineTo(x(i), y(point));
    });
    [...projection.currentSeries].reverse().forEach((point, reverseIndex) => {
      const i = projection.currentSeries.length - 1 - reverseIndex;
      ctx.lineTo(x(i), y(point));
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    const drawLine = (points: number[], color: string, widthLine: number) => {
      ctx.beginPath();
      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(x(i), y(point));
        else ctx.lineTo(x(i), y(point));
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = widthLine;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x(i), pad);
      ctx.lineTo(x(i), height - pad);
      ctx.stroke();
      ctx.fillStyle = "rgba(246,242,233,.46)";
      ctx.font = "600 12px Inter, sans-serif";
      ctx.fillText(`Y${i}`, x(i) - 8, height - 14);
    }

    drawLine(projection.currentSeries, "rgba(246,242,233,.48)", 2);
    drawLine(projection.optimizedSeries, "rgba(207,169,93,.92)", 3);

    ctx.fillStyle = "rgba(246,242,233,.72)";
    ctx.font = "700 13px Inter, sans-serif";
    ctx.fillText("Current Self", x(5) - 98, y(projection.currentSeries[5]) + 24);
    ctx.fillStyle = "rgba(207,169,93,.92)";
    ctx.fillText("Optimized Self", x(5) - 112, y(projection.optimizedSeries[5]) - 14);
  }, [projection]);

  return <canvas ref={canvasRef} className="divergence-canvas" aria-label="Future divergence between current self and optimized self" />;
}

function Field({
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>
        {label}
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input value={value} min={min} max={max} step={step} type="range" onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [inputs, setInputs] = useState<Inputs>(initialInputs);
  const projection = useMemo(() => computeProjection(inputs), [inputs]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const setInput = (key: keyof Inputs, value: number) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  return (
    <main>
      <section className="opening" aria-labelledby="opening-title">
        <motion.div
          className="opening-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="system-label">ShadowWorth AI</p>
          <h1 id="opening-title">Your habits are pricing your future<span className="cursor">.</span></h1>
          <p className="opening-line">Not a tracker. A mirror for invisible self-destruction.</p>
          <button
            className="quiet-button"
            type="button"
            onClick={() => {
              setStarted(true);
              window.setTimeout(() => document.querySelector("#mirror")?.scrollIntoView({ behavior: "smooth" }), 120);
            }}
          >
            Begin Analysis
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {started && (
          <motion.section
            className="mirror"
            id="mirror"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div className="mirror-grid">
              <aside className="input-ritual">
                <p className="system-label">Behavioral scan</p>
                <h2>Tell the system what you do when nobody is watching.</h2>
                <div className="numeric-pair">
                  <label>
                    Age
                    <input type="number" value={inputs.age} min={14} max={55} onChange={(event) => setInput("age", Number(event.target.value))} />
                  </label>
                  <label>
                    Monthly income
                    <input type="number" value={inputs.income} min={0} step={1000} onChange={(event) => setInput("income", Number(event.target.value))} />
                  </label>
                  <label>
                    5-year target
                    <input
                      type="number"
                      value={inputs.targetIncome}
                      min={0}
                      step={1000}
                      onChange={(event) => setInput("targetIncome", Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Monthly impulse spend
                    <input type="number" value={inputs.impulse} min={0} step={500} onChange={(event) => setInput("impulse", Number(event.target.value))} />
                  </label>
                </div>

                <Field label="Daily screen time" value={inputs.screenTime} suffix="h" min={0} max={12} step={0.25} onChange={(value) => setInput("screenTime", value)} />
                <Field label="Daily skill-building" value={inputs.learning} suffix="h" min={0} max={8} step={0.25} onChange={(value) => setInput("learning", value)} />
                <Field label="Procrastinated tasks weekly" value={inputs.procrastination} suffix="" min={0} max={30} step={1} onChange={(value) => setInput("procrastination", value)} />
                <Field label="Unused subscriptions" value={inputs.subscriptions} suffix="" min={0} max={8000} step={100} onChange={(value) => setInput("subscriptions", value)} />
                <Field label="Sleep consistency" value={Math.round(inputs.sleep * 100)} suffix="%" min={20} max={95} step={5} onChange={(value) => setInput("sleep", value / 100)} />

                <button className="text-button" type="button" onClick={() => setInputs(hardDemo)}>
                  Load uncomfortable demo
                </button>
              </aside>

              <section className="reveal-panel" aria-live="polite">
                <p className="system-label">Primary truth</p>
                <motion.h2 key={projection.truth} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                  {projection.truth}
                </motion.h2>
                <div className="identity-line">
                  <span>{projection.identity}</span>
                  <small>detected pattern</small>
                </div>

                <div className="divergence-card">
                  <div>
                    <p>Age {Math.min(inputs.age + 5, 99)} Projection</p>
                    <strong>{shortMoney(projection.divergence)}</strong>
                    <span>estimated lifetime potential gap</span>
                  </div>
                  <DivergenceCanvas projection={projection} />
                </div>

                <div className="path-grid">
                  <article>
                    <span>Current Path</span>
                    <strong>{money(projection.currentPath)}</strong>
                    <p>Projected yearly growth if the present pattern stays intact.</p>
                  </article>
                  <article>
                    <span>Optimized Path</span>
                    <strong>{money(projection.optimizedPath)}</strong>
                    <p>Projected yearly growth if attention and learning are protected.</p>
                  </article>
                </div>
              </section>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {started && (
        <section className="aftermath">
          <div className="aftermath-head">
            <p className="system-label">What is leaking</p>
            <h2>The system found four quiet forms of financial damage.</h2>
          </div>
          <div className="leak-list">
            {projection.leaks.map((leak, index) => (
              <motion.article
                key={leak.label}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.08, duration: 0.65 }}
              >
                <span>0{index + 1}</span>
                <h3>{leak.label}</h3>
                <strong>{money(leak.value)} / month</strong>
                <p>{leak.line}</p>
              </motion.article>
            ))}
          </div>
          <div className="closing-diagnosis">
            <p>
              ShadowWorth is not trying to shame the user. It makes the invisible visible early enough to change it.
            </p>
            <a href="#mirror">Re-run the mirror</a>
          </div>
        </section>
      )}
    </main>
  );
}
