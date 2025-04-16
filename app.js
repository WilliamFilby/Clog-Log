let userName = localStorage.getItem('userName') || '';
let reminderDay = localStorage.getItem('reminderDay') || '';
let reminderTime = localStorage.getItem('reminderTime') || '';
let hasLoadedBefore = localStorage.getItem('hasLoadedBefore') === 'true';
let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
let emojiList = ['🐴', '🐎', '🦄', '🏇', '🔨', '💩', '🛠️'];

function setPreferences() {
  userName = document.getElementById('nameInput').value;
  reminderDay = document.getElementById('reminderDay').value;
  reminderTime = document.getElementById('reminderTime').value;
  localStorage.setItem('userName', userName);
  localStorage.setItem('reminderDay', reminderDay);
  localStorage.setItem('reminderTime', reminderTime);
  localStorage.setItem('hasLoadedBefore', 'true');
  launchApp();
}

function getWeekKey(date = new Date()) {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.toLocaleDateString('en-GB')} - ${sunday.toLocaleDateString('en-GB')}`;
}

function togglePaid(id) {
  const job = jobs.find(j => j.id === id);
  job.paid = !job.paid;
  localStorage.setItem('jobs', JSON.stringify(jobs));
  renderWeek(job.week);
}

function confirmDelete(id) {
  if (confirm(`${userName}, are you sure?`)) {
    jobs = jobs.filter(j => j.id !== id);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    renderMenu();
  }
}

function addJob() {
  const customer = document.getElementById('customer').value;
  const horse = document.getElementById('horse').value;
  const service = document.getElementById('service').value;
  const price = document.getElementById('price').value;
  const jobDate = new Date(document.getElementById('jobDate').value);
  const paid = document.getElementById('paid').checked;
  const week = getWeekKey(jobDate);

  jobs.push({ id: Date.now(), customer, horse, service, price, date: jobDate.toLocaleDateString(), paid, week });
  localStorage.setItem('jobs', JSON.stringify(jobs));
  renderWeek(week);
}

function navigateWeek(offsetDays) {
  const base = new Date();
  base.setDate(base.getDate() + offsetDays);
  renderWeek(getWeekKey(base));
}

function showSplash(callback, delay = 6000) {
  const splash = document.getElementById('splash');
  splash.style.display = 'flex';
  const emojiEl = document.getElementById('emojiCycle');
  let i = 0;
  const cycle = setInterval(() => {
    emojiEl.innerText = ' ' + emojiList[i % emojiList.length];
    i++;
  }, 500);
  setTimeout(() => {
    clearInterval(cycle);
    splash.style.display = 'none';
    callback();
  }, delay);
}

function renderMenu() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  document.getElementById('mainMenu').style.display = 'block';
  document.getElementById('mainMenu').innerHTML = `
    <h2>${greet}, ${userName} 💪</h2>
    <button onclick="openNewEntry()">➕ New Input</button>
    <button onclick="openCurrentWeek()">📅 Current Week</button>
    <button onclick="openPastWeeks()">📖 Previous Weeks</button>
    <button onclick="editReminders()">⏰ Reminder Settings</button>
  `;
}

function openNewEntry() {
  document.getElementById('mainMenu').innerHTML = `
    <h3>➕ New Entry <button onclick="renderMenu()">🏠</button></h3>
    <form onsubmit="addJob(); return false;">
      <input type="text" id="customer" placeholder="👤 Client Name" required />
      <input type="text" id="horse" placeholder="🐴 Horse Name" required />
      <input type="text" id="service" placeholder="🛠 Service" required />
      <input type="number" id="price" placeholder="💷 Price (£)" required />
      <input type="date" id="jobDate" required />
      <label>Paid? <input type="checkbox" id="paid" /></label>
      <button type="submit">Save</button>
    </form>
  `;
}

function openCurrentWeek() {
  renderWeek(getWeekKey(new Date()));
}

function openPastWeeks() {
  const weeks = [...new Set(jobs.map(j => j.week))].filter(w => w !== getWeekKey(new Date()));
  let html = `<h3>📖 Select a Week <button onclick="renderMenu()">🏠</button></h3>`;
  weeks.forEach(w => html += `<button onclick="renderWeek('${w}')">📆 ${w}</button>`);
  document.getElementById('mainMenu').innerHTML = html;
}

function renderWeek(week) {
  const filtered = jobs.filter(j => j.week === week);
  let html = `
    <h3>📅 Week of ${week} <button onclick="renderMenu()">🏠</button></h3>
  `;
  filtered.forEach(job => {
    const status = job.paid ? 'paid' : 'unpaid';
    html += `
      <div class="card ${status}">
        <p><strong>${job.customer}</strong> – ${job.horse}<br>${job.service} – £${job.price}<br>Date: ${job.date}</p>
        <label>Paid: <input type="checkbox" onchange="togglePaid(${job.id})" ${job.paid ? 'checked' : ''}></label>
        <button onclick="confirmDelete(${job.id})">❌</button>
      </div>
    `;
  });
  html += `
    <div style="position:fixed; bottom:1rem; left:0; width:100%; display:flex; justify-content:space-between;">
      <button onclick="navigateWeek(-7)">⬅️</button>
      <button onclick="navigateWeek(7)">➡️</button>
    </div>
  `;
  document.getElementById('mainMenu').innerHTML = html;
}

function editReminders() {
  document.getElementById('mainMenu').innerHTML = `
    <h3>⏰ Edit Reminder Settings <button onclick="renderMenu()">🏠</button></h3>
    <label>Day:</label>
    <select id="editDay">
      <option>Sunday</option><option>Monday</option><option>Tuesday</option>
      <option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
    </select>
    <label>Time:</label>
    <input type="time" id="editTime" />
    <button onclick="saveReminderSettings()">Save</button>
  `;
  document.getElementById('editDay').value = reminderDay;
  document.getElementById('editTime').value = reminderTime;
}

function saveReminderSettings() {
  reminderDay = document.getElementById('editDay').value;
  reminderTime = document.getElementById('editTime').value;
  localStorage.setItem('reminderDay', reminderDay);
  localStorage.setItem('reminderTime', reminderTime);
  alert("Reminder updated!");
  renderMenu();
}

function checkReminder() {
  const now = new Date();
  const today = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const timeNow = now.toTimeString().slice(0,5);
  if (today === reminderDay && timeNow === reminderTime) {
    const unpaid = jobs.filter(j => !j.paid);
    const total = unpaid.reduce((sum, j) => sum + Number(j.price), 0);
    if (unpaid.length > 0 && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`You have ${unpaid.length} unpaid invoice(s).`, {
          body: `Total owed: £${total.toFixed(2)}.`,
          icon: 'https://emojiapi.dev/api/v1/horse/64.png'
        });
      }
    }
  }
}

function launchApp() {
  showSplash(() => {
    document.getElementById('setup').style.display = 'none';
    renderMenu();
    setInterval(checkReminder, 60000); // check every 60s
  }, 6000);
}

window.onload = () => {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
  if (!hasLoadedBefore) {
    showSplash(() => {
      document.getElementById('setup').style.display = 'block';
    }, 6000);
  } else {
    launchApp();
  }
};
