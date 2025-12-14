// Calendar Module
import { api, getCurrentUser } from './api.js';

export async function loadCalendarPage() {
  await renderCalendar();
}

async function renderCalendar() {
  const user = getCurrentUser();
  if (!user) return;

  const container = document.getElementById('calendar-container');
  if (!container) return;

  try {
    const allWorkouts = await api.getWorkouts();
    const userWorkouts = allWorkouts.filter(w => w.user_id === user.user_id);

    // Get workouts by date
    const workoutsByDate = {};
    userWorkouts.forEach(workout => {
      const dateKey = new Date(workout.date).toDateString();
      if (!workoutsByDate[dateKey]) {
        workoutsByDate[dateKey] = [];
      }
      workoutsByDate[dateKey].push(workout);
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Calendar HTML
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let calendarHTML = `
      <div class="calendar-header">
        <h3>${monthNames[month]} ${year}</h3>
      </div>
      <div class="calendar-grid">
    `;

    // Day headers
    dayNames.forEach(day => {
      calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="calendar-day"></div>';
    }

    // Days of the month
    const today = new Date().toDateString();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toDateString();
      const hasWorkout = workoutsByDate[dateKey] && workoutsByDate[dateKey].length > 0;
      const isToday = dateKey === today;

      let classes = 'calendar-day';
      if (hasWorkout) classes += ' has-workout';
      if (isToday) classes += ' today';

      const workoutCount = hasWorkout ? workoutsByDate[dateKey].length : 0;

      calendarHTML += `
        <div class="${classes}" onclick="showWorkoutsForDate('${dateKey}')">
          <div>${day}</div>
          ${hasWorkout ? `<div style="font-size: 0.7rem; margin-top: 0.25rem;">${workoutCount} workout${workoutCount > 1 ? 's' : ''}</div>` : ''}
        </div>
      `;
    }

    calendarHTML += '</div>';

    container.innerHTML = calendarHTML;
  } catch (error) {
    console.error('Error loading calendar:', error);
    container.innerHTML = '<p style="color: var(--error);">Error loading calendar. Please try again.</p>';
  }
}

window.showWorkoutsForDate = function(dateKey) {
  const user = getCurrentUser();
  if (!user) return;

  api.getWorkouts().then(allWorkouts => {
    const userWorkouts = allWorkouts.filter(w => w.user_id === user.user_id);
    const dateWorkouts = userWorkouts.filter(w => new Date(w.date).toDateString() === dateKey);

    if (dateWorkouts.length === 0) {
      alert('No workouts on this date');
      return;
    }

    const workoutList = dateWorkouts.map(w => 
      `• ${w.exercise}: ${w.sets} sets × ${w.reps} reps × ${w.weight}kg`
    ).join('\n');

    alert(`Workouts on ${new Date(dateKey).toLocaleDateString()}:\n\n${workoutList}`);
  }).catch(error => {
    console.error('Error loading workouts:', error);
    alert('Error loading workouts');
  });
};



