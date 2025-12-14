// Preferences module
import { api, getCurrentUser } from './api.js';

const { ref } = Vue;

export function usePreferences() {
  const preferences = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function loadPreferences(userId) {
    loading.value = true;
    error.value = null;
    try {
      const data = await api.getPreferences(userId);
      preferences.value = data.preferences;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function savePreferences(userId, prefs) {
    loading.value = true;
    error.value = null;
    try {
      const data = await api.updatePreferences(userId, prefs);
      preferences.value = data.preferences;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    preferences,
    loading,
    error,
    loadPreferences,
    savePreferences
  };
}

// Wrapper function to load preferences page using teacher's Vue logic
export async function loadPreferencesPage() {
  const user = getCurrentUser();
  if (!user) return;

  const container = document.getElementById('preferences-content');
  if (!container) return;

  const prefsModule = usePreferences();

  try {
    await prefsModule.loadPreferences(user.user_id);
    renderPreferences(prefsModule);
  } catch (error) {
    console.error('Error loading preferences:', error);
    container.innerHTML = '<p style="color: var(--error);">Error loading preferences. Please try again.</p>';
  }
}

function renderPreferences(prefsModule) {
  const container = document.getElementById('preferences-content');
  if (!container) return;

  const prefs = prefsModule.preferences.value || {
    kcal_target: 2000,
    macros: { protein: 120, carbs: 200, fat: 70 },
    liked_exercises: [],
    disliked_foods: [],
    days_per_week: 3
  };

  const likedExercisesHtml = (prefs.liked_exercises || []).map((ex, idx) => `
    <div class="exercise-item">
      <span>${ex}</span>
      <button class="btn-danger" onclick="removeLikedExercise(${idx})">Remove</button>
    </div>
  `).join('') || '<p style="color: var(--text-secondary);">No liked exercises</p>';

  const dislikedFoodsHtml = (prefs.disliked_foods || []).map((food, idx) => `
    <div class="exercise-item">
      <span>${food}</span>
      <button class="btn-danger" onclick="removeDislikedFood(${idx})">Remove</button>
    </div>
  `).join('') || '<p style="color: var(--text-secondary);">No disliked foods</p>';

  container.innerHTML = `
    <form id="preferences-form" style="max-width: 800px;">
      <div class="workout-card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">Calorie & Macro Targets</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Daily Calorie Target</label>
            <input type="number" id="kcal-target" value="${prefs.kcal_target}" min="1000" max="10000" required>
          </div>
          <div class="form-group">
            <label>Protein (g)</label>
            <input type="number" id="protein-target" value="${prefs.macros?.protein || 120}" min="0" required>
          </div>
          <div class="form-group">
            <label>Carbs (g)</label>
            <input type="number" id="carbs-target" value="${prefs.macros?.carbs || 200}" min="0" required>
          </div>
          <div class="form-group">
            <label>Fat (g)</label>
            <input type="number" id="fat-target" value="${prefs.macros?.fat || 70}" min="0" required>
          </div>
          <div class="form-group">
            <label>Workout Days/Week</label>
            <input type="number" id="days-per-week" value="${prefs.days_per_week || 3}" min="1" max="7" required>
          </div>
        </div>
      </div>

      <div class="workout-card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">Liked Exercises</h3>
        <div class="form-row" style="margin-bottom: 1rem;">
          <div class="form-group" style="flex: 1;">
            <input type="text" id="new-exercise" placeholder="Exercise name">
          </div>
          <div class="form-group">
            <button type="button" class="btn-secondary" onclick="addLikedExercise()">Add</button>
          </div>
        </div>
        <div class="exercise-list">
          ${likedExercisesHtml}
        </div>
      </div>

      <div class="workout-card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">Disliked Foods</h3>
        <div class="form-row" style="margin-bottom: 1rem;">
          <div class="form-group" style="flex: 1;">
            <input type="text" id="new-disliked-food" placeholder="Food name">
          </div>
          <div class="form-group">
            <button type="button" class="btn-secondary" onclick="addDislikedFood()">Add</button>
          </div>
        </div>
        <div class="exercise-list">
          ${dislikedFoodsHtml}
        </div>
      </div>

      <div id="preferences-error" class="error-message"></div>
      <button type="submit" class="btn-primary">Save Preferences</button>
    </form>
  `;

  // Store prefsModule for use in handlers
  window.currentPrefsModule = prefsModule;
  window.currentPreferences = prefs;

  document.getElementById('preferences-form')?.addEventListener('submit', handleSavePreferences);
}

window.addLikedExercise = function() {
  const input = document.getElementById('new-exercise');
  const exercise = input?.value.trim();
  if (!exercise) return;

  if (!window.currentPreferences.liked_exercises) {
    window.currentPreferences.liked_exercises = [];
  }
  window.currentPreferences.liked_exercises.push(exercise);
  input.value = '';
  renderPreferences(window.currentPrefsModule);
};

window.removeLikedExercise = function(index) {
  if (window.currentPreferences.liked_exercises) {
    window.currentPreferences.liked_exercises.splice(index, 1);
    renderPreferences(window.currentPrefsModule);
  }
};

window.addDislikedFood = function() {
  const input = document.getElementById('new-disliked-food');
  const food = input?.value.trim();
  if (!food) return;

  if (!window.currentPreferences.disliked_foods) {
    window.currentPreferences.disliked_foods = [];
  }
  window.currentPreferences.disliked_foods.push(food);
  input.value = '';
  renderPreferences(window.currentPrefsModule);
};

window.removeDislikedFood = function(index) {
  if (window.currentPreferences.disliked_foods) {
    window.currentPreferences.disliked_foods.splice(index, 1);
    renderPreferences(window.currentPrefsModule);
  }
};

async function handleSavePreferences(e) {
  e.preventDefault();
  const errorEl = document.getElementById('preferences-error');
  if (errorEl) errorEl.textContent = '';

  const user = getCurrentUser();
  if (!user || !window.currentPrefsModule) return;

  const preferences = {
    kcal_target: parseInt(document.getElementById('kcal-target')?.value),
    macros: {
      protein: parseFloat(document.getElementById('protein-target')?.value),
      carbs: parseFloat(document.getElementById('carbs-target')?.value),
      fat: parseFloat(document.getElementById('fat-target')?.value)
    },
    liked_exercises: window.currentPreferences.liked_exercises || [],
    disliked_foods: window.currentPreferences.disliked_foods || [],
    days_per_week: parseInt(document.getElementById('days-per-week')?.value)
  };

  try {
    await window.currentPrefsModule.savePreferences(user.user_id, preferences);
    window.currentPreferences = preferences;
    if (errorEl) {
      errorEl.textContent = 'Preferences saved successfully!';
      errorEl.style.color = 'var(--success)';
      setTimeout(() => {
        errorEl.textContent = '';
      }, 3000);
    }
  } catch (error) {
    console.error('Error saving preferences:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to save preferences';
    }
  }
}
