// Dashboard Module
import { api, getCurrentUser } from './api.js';
import { showPage } from './app.js';

export async function loadDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  // Update user email
  const emailEl = document.getElementById('user-email');
  if (emailEl) {
    emailEl.textContent = user.email || 'User';
  }

  try {
    // Load workouts
    const workouts = await api.getWorkouts();
    const userWorkouts = workouts.filter(w => w.user_id === user.user_id);
    const lastWorkout = userWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    const lastWorkoutEl = document.getElementById('last-workout');
    if (lastWorkoutEl) {
      if (lastWorkout) {
        const date = new Date(lastWorkout.date).toLocaleDateString();
        lastWorkoutEl.textContent = date;
      } else {
        lastWorkoutEl.textContent = 'No workouts yet';
      }
    }

    // Load meals
    const meals = await api.getMeals();
    const userMeals = meals.filter(m => m.user_id === user.user_id);
    const today = new Date().toDateString();
    const mealsToday = userMeals.filter(m => {
      const mealDate = new Date(m.date).toDateString();
      return mealDate === today;
    });

    const mealsTodayEl = document.getElementById('meals-today');
    if (mealsTodayEl) {
      mealsTodayEl.textContent = mealsToday.length;
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}



