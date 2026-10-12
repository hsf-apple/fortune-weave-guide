const STAGES = window.CAI_STAGES || [];
const STORAGE_KEY = "fortune-weave-guide:cai:stage-status:v1";
const STATUS_OPTIONS = ["Not started", "Training", "Certified", "Mastered", "Skipped"];

function loadStatuses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length === STAGES.length) {
      return saved.map(value => STATUS_OPTIONS.includes(value) ? value : "Not started");
    }
  } catch (_) { /* Storage may be unavailable in private browsing. */ }
  return STAGES.map(() => "Not started");
}

let statuses = loadStatuses();

function saveStatuses() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses)); }
  catch (_) { /* Tracking still works for this visit. */ }
}

function makeTextElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function makeDetail(label, value) {
  const box = makeTextElement("div", "stage-detail", "");
  box.append(makeTextElement("span", "detail-label", label));
  box.append(makeTextElement("p", "", value));
  return box;
}

function renderStages() {
  const list = document.getElementById("stage-list");
  list.replaceChildren();

  STAGES.forEach((stage, index) => {
    const article = makeTextElement("article", "stage-card", "");
    article.dataset.status = statuses[index].toLowerCase().replace(" ", "-");
    const top = makeTextElement("div", "stage-top", "");
    const title = makeTextElement("div", "stage-title", "");
    title.append(makeTextElement("span", "stage-number", String(index + 1).padStart(2, "0")));
    const copy = makeTextElement("div", "stage-title-copy", "");
    copy.append(makeTextElement("span", "stage-tier", stage.tier));
    copy.append(makeTextElement("h3", "", stage.name));
    title.append(copy);
    top.append(title);

    const label = makeTextElement("label", "status-control", "");
    label.htmlFor = "stage-status-" + index;
    label.append(makeTextElement("span", "", "Stage status"));
    const select = document.createElement("select");
    select.id = label.htmlFor;
    select.setAttribute("aria-label", stage.name + " stage status");
    STATUS_OPTIONS.forEach(option => {
      const item = document.createElement("option");
      item.value = option;
      item.textContent = option;
      select.append(item);
    });
    select.value = statuses[index];
    select.addEventListener("change", () => {
      statuses[index] = select.value;
      article.dataset.status = select.value.toLowerCase().replace(" ", "-");
      saveStatuses();
      updateProgress();
    });
    label.append(select);
    top.append(label);
    article.append(top);

    const details = makeTextElement("div", "stage-details", "");
    details.append(makeDetail("Train / priority", stage.train));
    details.append(makeDetail("Exam target", stage.exam));
    const mastery = makeTextElement("div", "stage-detail mastery-detail", "");
    mastery.append(makeTextElement("span", "detail-label", "Mastery reward"));
    mastery.append(makeTextElement("strong", "", stage.mastery));
    mastery.append(makeTextElement("p", "", stage.masteryDetail));
    details.append(mastery);
    article.append(details);

    const action = makeTextElement("div", "stage-action", "");
    action.append(makeTextElement("span", "action-label", "IN GAME"));
    action.append(makeTextElement("p", "", stage.action));
    article.append(action);
    list.append(article);
  });
  updateProgress();
}

function updateProgress() {
  const mastered = statuses.filter(status => status === "Mastered").length;
  const active = statuses.findIndex(status => status === "Training");
  const certified = statuses.filter(status => status === "Certified").length;
  document.getElementById("mastered-count").textContent = mastered;
  document.getElementById("progress-fill").style.width = (mastered / STAGES.length * 100) + "%";
  document.getElementById("progress-track").setAttribute("aria-valuenow", String(mastered));
  const message = document.getElementById("progress-message");
  if (mastered === STAGES.length) message.textContent = "All four class mastery rewards earned. Cai's route is complete!";
  else if (active >= 0) message.textContent = "Currently training: " + STAGES[active].name + ". Your changes stay in this browser.";
  else if (certified > 0) message.textContent = certified + " class" + (certified === 1 ? "" : "es") + " certified. Keep going to earn mastery rewards.";
  else if (mastered > 0) message.textContent = mastered + " of " + STAGES.length + " mastery rewards earned. Your changes stay in this browser.";
  else message.textContent = "Every class starts as Not started. Your changes stay in this browser.";
}

document.getElementById("reset-progress").addEventListener("click", () => {
  statuses = STAGES.map(() => "Not started");
  saveStatuses();
  renderStages();
});
document.getElementById("print-guide").addEventListener("click", () => window.print());
renderStages();
