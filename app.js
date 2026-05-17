const form = document.querySelector("#shadowForm");
const chart = document.querySelector("#trajectoryChart");
const ctx = chart.getContext("2d");
const lossNumber = document.querySelector("#lossNumber");
const toast = document.querySelector("#toast");

const fields = [
  "income",
  "targetIncome",
  "scrollHours",
  "studyHours",
  "impulseSpend",
  "subscriptions",
  "procrastination",
  "sleepQuality",
];

let latestSnapshot = null;

const goalWeights = {
  career: { skill: 1.12, risk: 1, stability: 0.88 },
  business: { skill: 1.2, risk: 1.12, stability: 0.82 },
  stability: { skill: 0.92, risk: 0.86, stability: 1.12 },
};

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getInputs() {
  const data = Object.fromEntries(fields.map((id) => [id, Number(document.querySelector(`#${id}`).value || 0)]));
  const goal = document.querySelector("input[name='goal']:checked").value;
  return { ...data, goal, weights: goalWeights[goal] };
}

function simulate(input) {
  const income = Math.max(input.income, 1);
  const targetIncome = Math.max(input.targetIncome, income);
  const incomeGap = Math.max(targetIncome - income, 0);
  const wastedHours = input.scrollHours + input.procrastination * 0.42;
  const deepWorkDeficit = clamp(2.5 - input.studyHours, 0, 2.5);
  const sleepDrag = 1 - input.sleepQuality;
  const attentionLeak = wastedHours * 30 * (income / 185) * 0.18;
  const skillDelay = incomeGap * (0.1 + deepWorkDeficit * 0.115 + sleepDrag * 0.11) * input.weights.skill;
  const cashLeak = (input.impulseSpend * 0.68 + input.subscriptions * 0.92) * input.weights.risk;
  const procrastinationCost = input.procrastination * 4.2 * (income / 185) * input.weights.skill;
  const healthRoutineDrag = sleepDrag * income * 0.07 * input.weights.stability;
  const monthlyLoss = attentionLeak + skillDelay / 12 + cashLeak + procrastinationCost + healthRoutineDrag;
  const annualLoss = monthlyLoss * 12;
  const fiveYearLoss = annualLoss * 5 * 1.11;
  const focusScore = clamp(Math.round(100 - input.scrollHours * 8 - input.procrastination * 2.2 + input.studyHours * 12 + input.sleepQuality * 14), 1, 100);
  const momentumScore = clamp(Math.round(100 - monthlyLoss / Math.max(income, 1) * 42 + input.studyHours * 8 + input.sleepQuality * 8), 1, 100);
  const skillGrowthPenalty = clamp((deepWorkDeficit * 12 + input.scrollHours * 2.4 + sleepDrag * 12) / 100, 0.02, 0.42);

  const best = [];
  const current = [];
  let bestValue = income * 12;
  let currentValue = income * 12;
  for (let year = 0; year <= 5; year += 1) {
    const progress = year / 5;
    const growthLift = incomeGap * 12 * progress * (0.42 + input.studyHours * 0.045);
    const drag = fiveYearLoss * progress * (0.22 + progress * 0.58);
    best.push(bestValue + growthLift + year * annualLoss * 0.42);
    current.push(Math.max(currentValue + growthLift * (1 - skillGrowthPenalty) - drag, income * 8));
  }

  return {
    attentionLeak,
    skillDelay,
    cashLeak,
    procrastinationCost,
    healthRoutineDrag,
    monthlyLoss,
    annualLoss,
    fiveYearLoss,
    focusScore,
    momentumScore,
    skillGrowthPenalty,
    best,
    current,
  };
}

function classify(input, result) {
  const scores = [
    { name: "Distracted Learner", score: input.scrollHours * 14 + Math.max(2 - input.studyHours, 0) * 18 },
    { name: "Impulsive Spender", score: input.impulseSpend / Math.max(input.income, 1) * 180 + input.subscriptions / 200 },
    { name: "Anxious Saver", score: Math.max(0, 65 - result.momentumScore) + Math.max(0, 1.5 - input.scrollHours) * 7 },
    { name: "Growth Optimizer", score: result.focusScore * 0.65 + input.studyHours * 8 - input.impulseSpend / 1200 },
    { name: "Hidden Achiever", score: input.studyHours * 12 + input.targetIncome / Math.max(input.income, 1) * 12 - input.procrastination * 2 },
  ];

  return scores.sort((a, b) => b.score - a.score)[0].name;
}

function topLeaks(result) {
  return [
    ["Skill-delay cost", result.skillDelay / 12, "Learning inconsistency is delaying your earning curve."],
    ["Attention leakage", result.attentionLeak, "Scrolling and task drift are draining monetizable hours."],
    ["Impulse cash burn", result.cashLeak, "Small purchases are compounding into identity-level leakage."],
    ["Procrastination tax", result.procrastinationCost, "Deferred work is converting ambition into avoidable cost."],
    ["Routine drag", result.healthRoutineDrag, "Low recovery quality is weakening focus and earning momentum."],
  ]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

function setGauge(id, value) {
  document.querySelector(id).style.setProperty("--score", value);
}

function updateRangeLabels(input) {
  document.querySelector("#scrollValue").textContent = `${Number(input.scrollHours).toFixed(input.scrollHours % 1 ? 2 : 0)}h`;
  document.querySelector("#studyValue").textContent = `${Number(input.studyHours).toFixed(input.studyHours % 1 ? 2 : 0)}h`;
}

function roadmap(input, result) {
  const leaks = topLeaks(result).map(([name]) => name);
  const steps = [];

  if (leaks.includes("Skill-delay cost")) {
    steps.push(`Protect a daily ${input.goal === "business" ? "90-minute build block" : "75-minute skill block"} before entertainment. This attacks the biggest future-income leak first.`);
  }
  if (leaks.includes("Attention leakage")) {
    steps.push("Cap scrolling with two fixed windows and move the first phone check after your first deep-work session.");
  }
  if (leaks.includes("Impulse cash burn")) {
    steps.push(`Create a 24-hour purchase delay for non-essential buys above ${currency(Math.max(input.income * 0.015, 500))}.`);
  }
  if (leaks.includes("Procrastination tax")) {
    steps.push("Convert postponed tasks into a visible weekly debt list, then clear the oldest two before starting new optional work.");
  }
  if (leaks.includes("Routine drag")) {
    steps.push("Stabilize sleep and recovery for 14 days; the model treats this as a multiplier on focus, not a lifestyle bonus.");
  }

  steps.push(`Re-run ShadowWorth weekly and aim to reduce monthly hidden loss below ${currency(result.monthlyLoss * 0.62)} within 30 days.`);
  return steps.slice(0, 4);
}

function drawChart(result) {
  const width = chart.width;
  const height = chart.height;
  const pad = 54;
  const values = [...result.best, ...result.current];
  const min = Math.min(...values) * 0.92;
  const max = Math.max(...values) * 1.08;
  const x = (index) => pad + (index / 5) * (width - pad * 2);
  const y = (value) => height - pad - ((value - min) / (max - min)) * (height - pad * 2);

  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#080b10");
  bg.addColorStop(1, "#050609");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,.07)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x(i), pad);
    ctx.lineTo(x(i), height - pad);
    ctx.stroke();
    ctx.fillStyle = "#8f98a6";
    ctx.font = "700 14px Inter, sans-serif";
    ctx.fillText(`Y${i}`, x(i) - 9, height - 14);
  }

  function line(points, color) {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color === "#58ffc2" ? "#f4c76a" : "#ff5f83");

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(x(index), y(point));
      else ctx.lineTo(x(index), y(point));
    });
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    points.forEach((point, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x(index), y(point), 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  line(result.best, "#58ffc2");
  line(result.current, "#ff5f83");

  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.font = "800 16px Inter, sans-serif";
  ctx.fillText(currency(max), pad, 28);
  ctx.fillText(currency(min), pad, height - 32);
}

function render() {
  const input = getInputs();
  const result = simulate(input);
  const identity = classify(input, result);
  const lossPercent = Math.round(result.skillGrowthPenalty * 100);
  latestSnapshot = { input, result, identity, lossPercent };

  updateRangeLabels(input);
  lossNumber.classList.add("is-updating");
  window.setTimeout(() => lossNumber.classList.remove("is-updating"), 160);

  lossNumber.textContent = currency(result.fiveYearLoss);
  document.querySelector("#lossCaption").textContent = `If the current pattern continues, projected earning growth may slow by about ${lossPercent}% across the next 5 years.`;
  document.querySelector("#focusScore").textContent = result.focusScore;
  document.querySelector("#momentumScore").textContent = result.momentumScore;
  document.querySelector("#identityType").textContent = identity;
  document.querySelector("#growthDrag").textContent = `${lossPercent}%`;
  document.querySelector("#monthlyLoss").textContent = `${currency(result.monthlyLoss)} / month`;
  document.querySelector("#timelineText").textContent = `This is the estimated wealth potential quietly disappearing each month through habit drag, delayed learning, and low-ROI spending.`;
  setGauge("#focusGauge", result.focusScore);
  setGauge("#momentumGauge", result.momentumScore);
  document.querySelector("#monthlyMeter").style.width = `${clamp(result.monthlyLoss / Math.max(input.income, 1) * 100, 8, 100)}%`;

  const leakList = document.querySelector("#leakList");
  leakList.innerHTML = topLeaks(result)
    .map(([name, amount, text]) => `<li><strong>${name}:</strong> ${currency(amount)} monthly. ${text}</li>`)
    .join("");

  const roadmapList = document.querySelector("#roadmapList");
  roadmapList.innerHTML = roadmap(input, result).map((step) => `<li>${step}</li>`).join("");

  drawChart(result);
}

function applyDemo() {
  const demo = {
    income: 28000,
    targetIncome: 160000,
    scrollHours: 6.75,
    studyHours: 0.75,
    impulseSpend: 8200,
    subscriptions: 2400,
    procrastination: 14,
    sleepQuality: 0.38,
  };

  Object.entries(demo).forEach(([id, value]) => {
    document.querySelector(`#${id}`).value = value;
  });
  document.querySelector("input[name='goal'][value='business']").checked = true;
  render();
}

async function copyInsight() {
  if (!latestSnapshot) return;
  const { result, identity, lossPercent } = latestSnapshot;
  const leaks = topLeaks(result).map(([name, amount]) => `${name}: ${currency(amount)}/month`).join("; ");
  const text = `ShadowWorth AI diagnosis: ${currency(result.fiveYearLoss)} estimated 5-year opportunity loss. Identity: ${identity}. Growth drag: ${lossPercent}%. Top leaks: ${leaks}.`;

  try {
    await navigator.clipboard.writeText(text);
    toast.textContent = "Insight copied";
  } catch {
    toast.textContent = text;
  }

  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

document.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("input", render);
  field.addEventListener("change", render);
});

document.querySelector("#loadDemo").addEventListener("click", applyDemo);
document.querySelector("#copyInsight").addEventListener("click", copyInsight);

render();
