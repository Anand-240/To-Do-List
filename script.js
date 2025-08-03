const form = document.getElementById("form");
const taskInput = document.getElementById("taskInput");
const dueInput = document.getElementById("dueInput");
const tasksEl = document.getElementById("tasks");
const noneEl = document.getElementById("none");
const clockEl = document.getElementById("clock");

let tasks = [];

// load saved
try {
  const stored = localStorage.getItem("simple_todo");
  if (stored) tasks = JSON.parse(stored).map(t => {
    if (t.due) t.due = new Date(t.due);
    if (t.created) t.created = new Date(t.created);
    return t;
  });
} catch {}

function save() {
  localStorage.setItem("simple_todo", JSON.stringify(tasks));
}

function formatDuration(ms) {
  if (ms <= 0) return "Overdue";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  parts.push(seconds + "s");
  return parts.join(" ");
}

function getStatus(task) {
  if (!task.due) return { label: "", flag: "" };
  const now = new Date();
  const diff = task.due - now;
  if (diff <= 0) return { label: "Overdue", flag: "overdue" };
  if (diff <= 1000 * 60 * 60) return { label: formatDuration(diff), flag: "soon" };
  return { label: formatDuration(diff), flag: "" };
}

function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString();
}

function render() {
  tasksEl.innerHTML = "";
  noneEl.style.display = tasks.length ? "none" : "block";

  tasks.forEach((t, i) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";
    if (t.completed) taskDiv.classList.add("completed");

    const left = document.createElement("div");
    left.style.flex = "1";

    const title = document.createElement("div");
    title.className = "text";
    title.textContent = t.text;
    left.appendChild(title);

    const info = document.createElement("div");
    info.className = "info";
    if (t.due) {
      const dueStr = t.due.toLocaleString([], {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
      const dueSpan = document.createElement("div");
      dueSpan.textContent = `Due: ${dueStr}`;

      const status = getStatus(t);
      const countdownSpan = document.createElement("div");
      countdownSpan.className = "countdown";
      countdownSpan.textContent = status.label;
      if (status.flag === "overdue") {
        countdownSpan.classList.add("overdue");
        taskDiv.classList.add("overdue");
      } else if (status.flag === "soon") {
        countdownSpan.classList.add("soon");
        taskDiv.classList.add("due-soon");
      }
      info.appendChild(dueSpan);
      info.appendChild(countdownSpan);
    } else {
      const noDue = document.createElement("div");
      noDue.textContent = "No due time";
      info.appendChild(noDue);
    }
    left.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "actions";

    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = "complete-btn";
    completeBtn.textContent = t.completed ? "Undo" : "Done";
    completeBtn.onclick = () => {
      t.completed = !t.completed;
      save();
      render();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      tasks.splice(i, 1);
      save();
      render();
    };

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    taskDiv.appendChild(left);
    taskDiv.appendChild(actions);
    tasksEl.appendChild(taskDiv);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  let due = null;
  if (dueInput.value) {
    const parsed = new Date(dueInput.value);
    if (!isNaN(parsed)) due = parsed;
  }
  tasks.push({ text, due, created: new Date(), completed: false });
  taskInput.value = "";
  dueInput.value = "";
  save();
  render();
});

// tick every second
setInterval(() => {
  updateClock();
  render(); // refresh countdowns with seconds
}, 1000);

updateClock();
render();