// Workouts Module
import { api, getCurrentUser } from './api.js';
import { showModal, closeModal } from './app.js';
import { loadExercises } from './exercises.js';

let exercises = [];

export async function loadWorkoutsPage() {
  await loadExercisesList();
  await renderWorkouts();
  
  // Create workout button
  document.getElementById('create-workout-btn')?.addEventListener('click', showCreateWorkoutModal);
}

async function loadExercisesList() {
  try {
    exercises = await api.getExercises();
    
    if (!exercises || exercises.length === 0) {
    }
  } catch (error) {
    console.error('Error loading exercises:', error);
    exercises = [];
    alert('Failed to load exercises. Please refresh the page or check your backend connection.');
  }
}

async function renderWorkouts() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const allWorkouts = await api.getWorkouts();
    const userWorkouts = allWorkouts.filter(w => w.user_id === user.user_id);
    
    // Group workout exercises by date
    const exercisesByDate = {};
    userWorkouts.forEach(workout => {
      const date = new Date(workout.date).toDateString();
      if (!exercisesByDate[date]) {
        exercisesByDate[date] = [];
      }
      // Loop through workout_exercises array
      if (workout.workout_exercises && workout.workout_exercises.length > 0) {
        workout.workout_exercises.forEach(exercise => {
          exercisesByDate[date].push({
            workout_id: workout.workout_id,
            exercise_name: exercise.exercises?.name || 'Exercise',
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight
          });
        });
      }
    });

    const container = document.getElementById('workouts-list');
    if (!container) return;

    const totalExercises = Object.values(exercisesByDate).reduce((sum, exercises) => sum + exercises.length, 0);
    if (totalExercises === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No workouts yet. Create your first workout!</p>';
      return;
    }

    // Sort dates descending
    const sortedDates = Object.keys(exercisesByDate).sort((a, b) => new Date(b) - new Date(a));

    container.innerHTML = sortedDates.map(date => {
      const exercises = exercisesByDate[date];
      return `
        <div class="workout-card">
          <div class="workout-header">
            <div class="workout-date">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <button class="btn-danger" onclick="deleteWorkoutsByDate('${date}')">Delete</button>
          </div>
          <div class="exercise-list">
            ${exercises.map(exercise => `
              <div class="exercise-item">
                <div>
                  <div class="exercise-name">${exercise.exercise_name}</div>
                  <div class="exercise-details">${exercise.sets} sets × ${exercise.reps} reps × ${exercise.weight}kg</div>
                </div>
                <button class="btn-danger" onclick="deleteWorkout(${exercise.workout_id})">Delete</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading workouts:', error);
    const container = document.getElementById('workouts-list');
    if (container) {
      container.innerHTML = '<p style="color: var(--error);">Error loading workouts. Please try again.</p>';
    }
  }
}

function showCreateWorkoutModal() {
  const date = new Date().toISOString().split('T')[0];
  
  if (!exercises || exercises.length === 0) {
    loadExercisesList().then(() => {
      // Retry showing modal after exercises are loaded
      showCreateWorkoutModal();
    });
    return;
  }

  // Map exercises to select options
  const exercisesHtml = exercises.map(ex => {
    const exerciseName = ex.name || ex.exercise_name || ex.exercise || 'Unknown';
    const exerciseValue = ex.name || ex.exercise_name || ex.exercise || '';
    return `<option value="${exerciseValue}">${exerciseName}</option>`;
  }).join('');

  const modalContent = `
    <form id="create-workout-form">
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="workout-date" value="${date}" required>
      </div>
      <div id="exercises-container">
        <div class="exercise-form-item">
          <div class="form-row">
            <div class="form-group">
              <label>Exercise</label>
              <select id="exercise-0" required>
                <option value="">Select exercise</option>
                ${exercisesHtml}
              </select>
            </div>
            <div class="form-group">
              <label>Sets</label>
              <input type="number" id="sets-0" min="1" value="3" required>
            </div>
            <div class="form-group">
              <label>Reps</label>
              <input type="number" id="reps-0" min="1" value="10" required>
            </div>
            <div class="form-group">
              <label>Weight (kg)</label>
              <input type="number" id="weight-0" min="0" step="0.5" value="0" required>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top: 1rem;">
        <button type="button" class="btn-secondary" onclick="addExerciseField()">➕ Add Exercise</button>
      </div>
      <div id="workout-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Create Workout</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  showModal('Create Workout', modalContent);

  // Set exercise counter
  window.exerciseCounter = 1;

  // Form submit handler
  document.getElementById('create-workout-form')?.addEventListener('submit', handleCreateWorkout);
}

window.addExerciseField = function() {
  const container = document.getElementById('exercises-container');
  if (!container) return;

  if (!exercises || exercises.length === 0) {
    return;
  }

  // Map exercises to select options
  const exercisesHtml = exercises.map(ex => {
    const exerciseName = ex.name || ex.exercise_name || ex.exercise || 'Unknown';
    const exerciseValue = ex.name || ex.exercise_name || ex.exercise || '';
    return `<option value="${exerciseValue}">${exerciseName}</option>`;
  }).join('');

  const newExercise = document.createElement('div');
  newExercise.className = 'exercise-form-item';
  newExercise.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Exercise</label>
        <select id="exercise-${window.exerciseCounter}" required>
          <option value="">Select exercise</option>
          ${exercisesHtml}
        </select>
      </div>
      <div class="form-group">
        <label>Sets</label>
        <input type="number" id="sets-${window.exerciseCounter}" min="1" value="3" required>
      </div>
      <div class="form-group">
        <label>Reps</label>
        <input type="number" id="reps-${window.exerciseCounter}" min="1" value="10" required>
      </div>
      <div class="form-group">
        <label>Weight (kg)</label>
        <input type="number" id="weight-${window.exerciseCounter}" min="0" step="0.5" value="0" required>
      </div>
      <div class="form-group" style="display: flex; align-items: flex-end;">
        <button type="button" class="btn-danger" onclick="this.closest('.exercise-form-item').remove()">Remove</button>
      </div>
    </div>
  `;
  container.appendChild(newExercise);
  window.exerciseCounter++;
};

async function handleCreateWorkout(e) {
  e.preventDefault();
  const errorEl = document.getElementById('workout-error');
  if (errorEl) errorEl.textContent = '';

  const date = document.getElementById('workout-date')?.value;
  if (!date) return;

  // Get all exercise fields
  const exerciseItems = document.querySelectorAll('.exercise-form-item');
  const exercises = [];

  for (let item of exerciseItems) {
    const index = Array.from(exerciseItems).indexOf(item);
    const exercise = document.getElementById(`exercise-${index}`)?.value;
    const sets = parseInt(document.getElementById(`sets-${index}`)?.value);
    const reps = parseInt(document.getElementById(`reps-${index}`)?.value);
    const weight = parseFloat(document.getElementById(`weight-${index}`)?.value);

    if (exercise && sets && reps !== undefined && weight !== undefined) {
      exercises.push({ exercise, sets, reps, weight });
    }
  }

  if (exercises.length === 0) {
    if (errorEl) errorEl.textContent = 'Please add at least one exercise';
    return;
  }

  try {
    // Create workout for each exercise
    for (const ex of exercises) {
      await api.createWorkout({
        exercise: ex.exercise,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        date: date
      });
    }

    closeModal();
    await renderWorkouts();
  } catch (error) {
    console.error('Error creating workout:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to create workout';
    }
  }
}

window.deleteWorkout = async function(workoutId) {
  if (!confirm('Delete this workout exercise?')) return;

  try {
    await api.deleteWorkout(workoutId);
    await renderWorkouts();
  } catch (error) {
    console.error('Error deleting workout:', error);
    alert('Failed to delete workout');
  }
};

window.deleteWorkoutsByDate = async function(date) {
  if (!confirm('Delete all workouts for this date?')) return;

  const user = getCurrentUser();
  if (!user) return;

  try {
    const allWorkouts = await api.getWorkouts();
    const userWorkouts = allWorkouts.filter(w => w.user_id === user.user_id);
    const dateWorkouts = userWorkouts.filter(w => new Date(w.date).toDateString() === date);

    for (const workout of dateWorkouts) {
      await api.deleteWorkout(workout.workout_id);
    }

    await renderWorkouts();
  } catch (error) {
    console.error('Error deleting workouts:', error);
    alert('Failed to delete workouts');
  }
};

// Make closeModal available globally
window.closeModal = closeModal;
