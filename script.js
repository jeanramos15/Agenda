function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      console.log("Permissão:", permission);
    });
  }
}
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function renderTasks() {
  const todayList = document.getElementById("todayList");
  const completedList = document.getElementById("completedList");

  todayList.innerHTML = "";
  completedList.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>
        ${task.text} <br>
        <small>${task.date} ${task.time}</small>
      </span>
      <div>
        <button onclick="toggleTask(${index})">✔</button>
        <button onclick="deleteTask(${index})">🗑</button>
      </div>
    `;

    if (task.completed) {
      li.className = "completed";
      completedList.appendChild(li);
    } else if (task.date === today) {
      todayList.appendChild(li);
    }
  });
}

function addTask() {
  const text = document.getElementById("taskInput").value;
  const date = document.getElementById("dateInput").value;
  const time = document.getElementById("timeInput").value;

  if (!text) return;

  tasks.push({
    text,
    date,
    time,
    completed: false,
    notified: false,
    notifiedExact: false
  });

  saveTasks();
  renderTasks();

  document.getElementById("taskInput").value = "";
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

renderTasks();

function checkNotifications() {
  const now = new Date();

  tasks.forEach(task => {
    if (task.completed) return;

    const taskDateTime = new Date(`${task.date}T${task.time}`);
    const diff = taskDateTime - now;

    const tenMinutes = 10 * 60 * 1000;

    if (
      diff <= tenMinutes &&
      diff > 0 &&
      !task.notified
    ) {
      if (Notification.permission === "granted") {
        new Notification("Lembrete em 10 minutos", {
          body: task.text
        });
      }

      task.notified = true;
      saveTasks();
    }
  });
}

setInterval(checkNotifications, 60000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registrado"));
}