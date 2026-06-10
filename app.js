const STORAGE_KEY = "prioritai_requests_v1";

const weights = {
  businessValue: 0.35,
  strategicAlignment: 0.15,
  feasibility: 0.20,
  dataReadiness: 0.15,
  urgencyRisk: 0.10,
  userImpact: 0.05
};

const sampleRequests = [
  {
    name: "Blocked cargo follow-up automation",
    department: "Operations",
    type: "RPA / Automation",
    pattern: "repetitive_rule_based",
    problem: "Regional teams manually check blocked cargo at the beginning and end of each shift and send follow-up emails.",
    benefit: "Reduce repetitive checks, improve response speed and standardize escalation.",
    owner: "Operations Excellence",
    users: 45,
    fte: 1.2,
    businessImpact: 5,
    financialImpact: 4,
    errorReduction: 5,
    strategicAlignment: 4,
    feasibility: 4,
    dataReadiness: 3,
    urgency: 4,
    risk: 4,
    hasClearDataSource: true,
    isStandardProcess: true,
    hasKnownDependency: true
  },
  {
    name: "Customer feedback AI classifier",
    department: "Customer Experience",
    type: "AI / ML",
    pattern: "prediction_classification",
    problem: "Feedback messages are read manually and routed to the relevant team with inconsistent tags.",
    benefit: "Classify feedback faster, identify recurring themes and reduce manual routing time.",
    owner: "CX Analytics",
    users: 22,
    fte: 0.7,
    businessImpact: 4,
    financialImpact: 3,
    errorReduction: 4,
    strategicAlignment: 5,
    feasibility: 3,
    dataReadiness: 4,
    urgency: 3,
    risk: 3,
    hasClearDataSource: true,
    isStandardProcess: true,
    hasKnownDependency: false
  },
  {
    name: "Weekly report auto-generation",
    department: "Planning",
    type: "Dashboard / BI",
    pattern: "reporting_decision",
    problem: "Teams manually combine Excel files to prepare weekly management reports.",
    benefit: "Save report preparation time and create a single trusted view.",
    owner: "Planning Team",
    users: 18,
    fte: 0.4,
    businessImpact: 3,
    financialImpact: 2,
    errorReduction: 4,
    strategicAlignment: 3,
    feasibility: 5,
    dataReadiness: 4,
    urgency: 2,
    risk: 2,
    hasClearDataSource: true,
    isStandardProcess: true,
    hasKnownDependency: false
  },
  {
    name: "Dashboard color refresh",
    department: "Other",
    type: "Process Improvement",
    pattern: "unclear",
    problem: "A dashboard needs visual changes to match the new design language.",
    benefit: "Improve visual consistency.",
    owner: "Business Team",
    users: 8,
    fte: 0.05,
    businessImpact: 1,
    financialImpact: 1,
    errorReduction: 1,
    strategicAlignment: 2,
    feasibility: 5,
    dataReadiness: 5,
    urgency: 1,
    risk: 1,
    hasClearDataSource: true,
    isStandardProcess: true,
    hasKnownDependency: false
  }
];

const form = document.getElementById("requestForm");
const tableBody = document.getElementById("requestTableBody");
const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");
const resultScore = document.getElementById("resultScore");
const resultTitle = document.getElementById("resultTitle");
const resultLevel = document.getElementById("resultLevel");
const resultTrack = document.getElementById("resultTrack");
const resultBadges = document.getElementById("resultBadges");
const resultSummary = document.getElementById("resultSummary");
const resultNextStep = document.getElementById("resultNextStep");
const breakdown = document.getElementById("breakdown");

let requests = loadRequests();

function track(eventName, payload = {}) {
  if (typeof window.prioritaiTrack === "function") {
    window.prioritaiTrack(eventName, payload);
  }
}

function loadRequests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (_error) {
    return [];
  }
}

function saveRequests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function normalizeScore(value) {
  return Number(value) * 20;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function userImpactScore(users) {
  const count = Number(users || 0);
  if (count >= 100) return 100;
  if (count >= 50) return 90;
  if (count >= 20) return 80;
  if (count >= 10) return 60;
  if (count >= 3) return 40;
  return 20;
}

function fteImpactScore(fte) {
  const value = Number(fte || 0);
  if (value >= 2) return 100;
  if (value >= 1) return 90;
  if (value >= 0.5) return 75;
  if (value >= 0.2) return 55;
  if (value > 0) return 35;
  return 20;
}

function calculateEligibility(input, duplicateCandidates) {
  const flags = [];
  const missing = [];

  if (!input.name?.trim()) missing.push("request name");
  if (!input.owner?.trim()) missing.push("owner");
  if (!input.problem?.trim()) missing.push("problem statement");
  if (!input.benefit?.trim()) missing.push("expected benefit");
  if (!input.hasClearDataSource) flags.push({ label: "Data source unclear", type: "warning" });
  if (duplicateCandidates.length > 0) flags.push({ label: "Possible duplicate", type: "warning" });

  if (missing.length > 0) {
    return {
      status: "Needs More Information",
      flags: [{ label: `Missing: ${missing.join(", ")}`, type: "danger" }, ...flags]
    };
  }

  return {
    status: flags.some((flag) => flag.label === "Data source unclear") ? "Ready with Risk" : "Ready to Score",
    flags
  };
}

function similarity(a, b) {
  const wordsA = new Set(String(a).toLowerCase().split(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/).filter(Boolean));
  const wordsB = new Set(String(b).toLowerCase().split(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/).filter(Boolean));
  const intersection = [...wordsA].filter((word) => wordsB.has(word)).length;
  const union = new Set([...wordsA, ...wordsB]).size || 1;
  return intersection / union;
}

function findDuplicates(input) {
  return requests.filter((request) => similarity(request.name, input.name) >= 0.42);
}

function recommendTrack(input) {
  if (input.pattern === "repetitive_rule_based") return "RPA / Automation";
  if (input.pattern === "prediction_classification") return input.dataReadiness >= 3 ? "AI / ML" : "Data Preparation First";
  if (input.pattern === "reporting_decision") return "Dashboard / BI";
  if (input.pattern === "routing_scheduling") return "Optimization";
  if (input.type === "AI / ML" && input.dataReadiness <= 2) return "Discovery before AI";
  return input.type;
}

function calculatePriority(rawInput) {
  const duplicateCandidates = findDuplicates(rawInput);
  const eligibility = calculateEligibility(rawInput, duplicateCandidates);

  const businessValue = Math.round(
    normalizeScore(rawInput.businessImpact) * 0.34 +
      fteImpactScore(rawInput.fte) * 0.28 +
      normalizeScore(rawInput.financialImpact) * 0.18 +
      normalizeScore(rawInput.errorReduction) * 0.20
  );

  const strategicAlignment = normalizeScore(rawInput.strategicAlignment);

  let feasibility = normalizeScore(rawInput.feasibility);
  if (rawInput.hasKnownDependency) feasibility -= 12;
  if (!rawInput.isStandardProcess) feasibility -= 14;
  feasibility = clamp(feasibility, 20, 100);

  let dataReadiness = normalizeScore(rawInput.dataReadiness);
  if (!rawInput.hasClearDataSource) dataReadiness = Math.min(dataReadiness, 45);
  if (rawInput.type === "AI / ML" && rawInput.dataReadiness <= 2) dataReadiness = Math.min(dataReadiness, 40);

  const urgencyRisk = Math.round((normalizeScore(rawInput.urgency) + normalizeScore(rawInput.risk)) / 2);
  const userImpact = userImpactScore(rawInput.users);

  const score = Math.round(
    businessValue * weights.businessValue +
      strategicAlignment * weights.strategicAlignment +
      feasibility * weights.feasibility +
      dataReadiness * weights.dataReadiness +
      urgencyRisk * weights.urgencyRisk +
      userImpact * weights.userImpact
  );

  const level = getPriorityLevel(score);
  const trackName = recommendTrack(rawInput);
  const badges = buildBadges({
    score,
    businessValue,
    feasibility,
    dataReadiness,
    urgencyRisk,
    input: rawInput,
    eligibility,
    trackName
  });

  const confidence = calculateConfidence(rawInput, eligibility, duplicateCandidates);
  const summary = generateSummary({
    input: rawInput,
    score,
    level,
    businessValue,
    feasibility,
    dataReadiness,
    urgencyRisk,
    trackName,
    confidence
  });
  const nextStep = generateNextStep({ input: rawInput, score, dataReadiness, feasibility, eligibility, trackName });

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    ...rawInput,
    score,
    level,
    trackName,
    confidence,
    eligibilityStatus: eligibility.status,
    duplicateCount: duplicateCandidates.length,
    badges,
    summary,
    nextStep,
    breakdown: {
      "Business Value": businessValue,
      "Strategic Alignment": strategicAlignment,
      Feasibility: feasibility,
      "Data Readiness": dataReadiness,
      "Urgency & Risk": urgencyRisk,
      "User Impact": userImpact
    }
  };
}

function calculateConfidence(input, eligibility, duplicates) {
  let confidence = 88;
  if (eligibility.status !== "Ready to Score") confidence -= 12;
  if (!input.hasClearDataSource) confidence -= 12;
  if (input.hasKnownDependency) confidence -= 8;
  if (!input.isStandardProcess) confidence -= 8;
  if (duplicates.length > 0) confidence -= 10;
  if (String(input.problem || "").length < 60) confidence -= 4;
  if (String(input.benefit || "").length < 50) confidence -= 4;
  return clamp(confidence, 35, 96);
}

function getPriorityLevel(score) {
  if (score >= 80) return "High Priority";
  if (score >= 60) return "Medium Priority";
  if (score >= 40) return "Low Priority";
  return "Not Recommended";
}

function buildBadges({ score, businessValue, feasibility, dataReadiness, urgencyRisk, input, eligibility, trackName }) {
  const badges = [];
  badges.push({ label: eligibility.status, type: eligibility.status === "Ready to Score" ? "success" : "warning" });
  badges.push({ label: `${trackName} track`, type: "" });

  if (businessValue >= 80 && feasibility >= 75 && dataReadiness >= 70) {
    badges.push({ label: "Quick Win", type: "success" });
  }
  if (businessValue >= 80 && (feasibility < 60 || dataReadiness < 60)) {
    badges.push({ label: "High Value / High Risk", type: "warning" });
  }
  if (input.type === "AI / ML" && dataReadiness < 60) {
    badges.push({ label: "AI Data Risk", type: "danger" });
  }
  if (input.fte >= 0.5) {
    badges.push({ label: "Meaningful FTE Saving", type: "success" });
  }
  if (urgencyRisk >= 80) {
    badges.push({ label: "Urgent", type: "warning" });
  }
  if (score < 40) {
    badges.push({ label: "Park for Later", type: "danger" });
  }
  return [...eligibility.flags, ...badges];
}

function generateSummary({ input, score, level, businessValue, feasibility, dataReadiness, urgencyRisk, trackName, confidence }) {
  const strengths = [];
  const risks = [];

  if (businessValue >= 80) strengths.push("strong business value and measurable time-saving potential");
  if (Number(input.fte) >= 0.5) strengths.push(`estimated ${input.fte} FTE/month saving`);
  if (normalizeScore(input.errorReduction) >= 80) strengths.push("clear manual error or rework reduction potential");
  if (normalizeScore(input.strategicAlignment) >= 80) strengths.push("strong alignment with digitalization / automation strategy");
  if (urgencyRisk >= 75) strengths.push("meaningful urgency or operational risk reduction");

  if (feasibility < 60) risks.push("technical feasibility or dependency risk");
  if (dataReadiness < 60) risks.push("data availability or quality risk");
  if (input.hasKnownDependency) risks.push("heavy IT or system dependency");
  if (!input.isStandardProcess) risks.push("process standardization gap");

  const strengthText = strengths.length ? strengths.join(", ") : "moderate value signals";
  const riskText = risks.length ? `Main risks: ${risks.join(", ")}.` : "No major delivery blocker is visible from the current input.";

  return `This request scored ${score}/100 and is classified as ${level}. It is recommended for the ${trackName} path because it shows ${strengthText}. ${riskText} Confidence score is ${confidence}%, based on input completeness, data clarity and delivery risk.`;
}

function generateNextStep({ input, score, dataReadiness, feasibility, eligibility, trackName }) {
  if (eligibility.status === "Needs More Information") {
    return "Clarify missing business owner, expected benefit, data source and measurable success criteria before prioritization review.";
  }
  if (input.type === "AI / ML" && dataReadiness < 60) {
    return "Run a short data discovery: confirm historical data, data owner, access path, target variable and minimum sample volume before AI development.";
  }
  if (score >= 80 && feasibility >= 70) {
    return "Move to business review, prepare a one-page process document and create the implementation backlog item.";
  }
  if (score >= 60) {
    return "Keep in the quarterly planning backlog and validate feasibility, dependency owners and expected benefit with the requesting department.";
  }
  return "Park for later or combine with a broader initiative unless the business impact or urgency increases.";
}

function getFormInput() {
  const data = new FormData(form);
  const input = Object.fromEntries(data.entries());
  const numericFields = [
    "users",
    "fte",
    "businessImpact",
    "financialImpact",
    "errorReduction",
    "strategicAlignment",
    "feasibility",
    "dataReadiness",
    "urgency",
    "risk"
  ];
  numericFields.forEach((field) => {
    input[field] = Number(input[field] || 0);
  });
  input.hasClearDataSource = data.has("hasClearDataSource");
  input.isStandardProcess = data.has("isStandardProcess");
  input.hasKnownDependency = data.has("hasKnownDependency");
  return input;
}

function renderResult(result) {
  resultTitle.textContent = result.name;
  resultScore.dataset.score = result.score;
  resultScore.style.setProperty("--score", result.score);
  resultLevel.textContent = result.level;
  resultTrack.textContent = `${result.trackName} · ${result.confidence}% confidence`;
  resultSummary.textContent = result.summary;
  resultNextStep.textContent = result.nextStep;

  resultBadges.innerHTML = "";
  result.badges.forEach((badge) => {
    const span = document.createElement("span");
    span.className = `badge ${badge.type || ""}`.trim();
    span.textContent = badge.label;
    resultBadges.appendChild(span);
  });

  breakdown.innerHTML = "";
  Object.entries(result.breakdown).forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "breakdown-row";
    row.innerHTML = `
      <span>${label}</span>
      <div class="bar"><span style="--width:${value}%"></span></div>
      <strong>${value}</strong>
    `;
    breakdown.appendChild(row);
  });
}

function renderMetrics() {
  const high = requests.filter((request) => request.level === "High Priority").length;
  const quickWins = requests.filter((request) => request.badges.some((badge) => badge.label === "Quick Win")).length;
  const highRisk = requests.filter((request) => request.badges.some((badge) => badge.label === "High Value / High Risk" || badge.type === "danger")).length;

  document.getElementById("metricTotal").textContent = requests.length;
  document.getElementById("metricHigh").textContent = high;
  document.getElementById("metricQuickWins").textContent = quickWins;
  document.getElementById("metricRisk").textContent = highRisk;
}

function priorityClass(level) {
  if (level === "High Priority") return "high";
  if (level === "Medium Priority") return "medium";
  if (level === "Low Priority") return "low";
  return "not";
}

function filteredRequests() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = priorityFilter.value;
  return [...requests]
    .sort((a, b) => b.score - a.score)
    .filter((request) => {
      const matchesQuery = !query || [request.name, request.department, request.type, request.trackName]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesPriority = filter === "all" || request.level === filter;
      return matchesQuery && matchesPriority;
    });
}

function renderTable() {
  const rows = filteredRequests();
  tableBody.innerHTML = "";

  if (!rows.length) {
    tableBody.innerHTML = `<tr><td colspan="9" class="empty">No matching requests.</td></tr>`;
    return;
  }

  rows.forEach((request, index) => {
    const flagText = request.badges
      .slice(0, 3)
      .map((badge) => badge.label)
      .join(", ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${index + 1}</td>
      <td><strong>${escapeHtml(request.name)}</strong><small>${escapeHtml(request.eligibilityStatus)} · ${request.confidence}% confidence</small></td>
      <td>${escapeHtml(request.department)}</td>
      <td>${escapeHtml(request.type)}</td>
      <td><span class="score-pill">${request.score}</span></td>
      <td><span class="priority-pill ${priorityClass(request.level)}">${escapeHtml(request.level)}</span></td>
      <td>${escapeHtml(request.trackName)}</td>
      <td><small>${escapeHtml(flagText)}</small></td>
      <td><button class="delete-row" data-id="${request.id}" aria-label="Delete request">Delete</button></td>
    `;
    tr.addEventListener("click", (event) => {
      if (event.target.classList.contains("delete-row")) return;
      renderResult(request);
      track("request_selected", { requestId: request.id, score: request.score, level: request.level });
      document.getElementById("resultPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    tableBody.appendChild(tr);
  });

  document.querySelectorAll(".delete-row").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const deleted = requests.find((request) => request.id === id);
      requests = requests.filter((request) => request.id !== id);
      saveRequests();
      renderAll();
      track("request_deleted", { requestId: id, requestName: deleted?.name });
    });
  });
}

function renderAll() {
  renderMetrics();
  renderTable();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupSliders() {
  document.querySelectorAll('input[type="range"]').forEach((slider) => {
    const output = document.getElementById(`${slider.id}Value`);
    if (output) output.value = slider.value;
    slider.addEventListener("input", () => {
      if (output) output.value = slider.value;
    });
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = getFormInput();
  const result = calculatePriority(input);
  requests.push(result);
  saveRequests();
  renderResult(result);
  renderAll();
  track("score_calculated", {
    requestId: result.id,
    requestName: result.name,
    department: result.department,
    requestType: result.type,
    score: result.score,
    priorityLevel: result.level,
    recommendedTrack: result.trackName,
    confidence: result.confidence
  });
  document.getElementById("resultPanel").scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput.addEventListener("input", () => {
  renderTable();
  track("dashboard_filtered", { query: searchInput.value, priority: priorityFilter.value });
});

priorityFilter.addEventListener("change", () => {
  renderTable();
  track("dashboard_filtered", { query: searchInput.value, priority: priorityFilter.value });
});

document.getElementById("loadSamplesBtn").addEventListener("click", () => {
  const scoredSamples = sampleRequests.map((request) => calculatePriority(request));
  requests = scoredSamples;
  saveRequests();
  renderAll();
  renderResult(requests[0]);
  track("sample_requests_loaded", { count: scoredSamples.length });
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(requests, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prioritai-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  track("requests_exported", { count: requests.length });
});

document.getElementById("resetFormBtn").addEventListener("click", () => {
  form.reset();
  setupSliders();
});

document.getElementById("scrollToFormBtn").addEventListener("click", () => {
  document.getElementById("requestFormSection").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("heroNewRequestBtn").addEventListener("click", () => {
  document.getElementById("requestFormSection").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("viewDashboardBtn").addEventListener("click", () => {
  document.getElementById("dashboardSection").scrollIntoView({ behavior: "smooth" });
});

setupSliders();
renderAll();
if (requests[0]) renderResult([...requests].sort((a, b) => b.score - a.score)[0]);
track("dashboard_rendered", { requestCount: requests.length });
