// AI Tools Module
import { api, getCurrentUser } from './api.js';
import { showModal, closeModal } from './app.js';

export async function loadAIPage() {
  const container = document.getElementById('ai-content');
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-grid">
      <div class="stat-card" style="cursor: pointer;" data-ai-tool="workout-plan">
        <div class="stat-icon">💪</div>
        <div class="stat-info">
          <h3>Workout Plan</h3>
          <p>Generate a personalized weekly workout plan</p>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" data-ai-tool="freestyle">
        <div class="stat-icon">🔥</div>
        <div class="stat-info">
          <h3>Freestyle Workout</h3>
          <p>Get a random circuit workout</p>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" data-ai-tool="recipes">
        <div class="stat-icon">🍳</div>
        <div class="stat-info">
          <h3>AI Recipe</h3>
          <p>Generate a meal recipe based on calories</p>
        </div>
      </div>
    </div>
    <div id="ai-results" style="margin-top: 2rem;"></div>
  `;

  // Add click handlers
  document.querySelectorAll('[data-ai-tool]').forEach(card => {
    card.addEventListener('click', () => {
      const tool = card.getAttribute('data-ai-tool');
      handleAITool(tool);
    });
  });
}

async function handleAITool(tool) {
  switch(tool) {
    case 'workout-plan':
      showWorkoutPlanModal();
      break;
    case 'freestyle':
      showFreestyleModal();
      break;
    case 'recipes':
      showRecipeModal();
      break;
  }
}

function showWorkoutPlanModal() {
  const modalContent = `
    <form id="workout-plan-form">
      <div class="form-row">
        <div class="form-group">
          <label>Days per Week</label>
          <input type="number" id="plan-days" min="1" max="6" value="3" required>
        </div>
        <div class="form-group">
          <label>Goal</label>
          <select id="plan-goal" required>
            <option value="balanced">Balanced</option>
            <option value="strength">Strength</option>
            <option value="endurance">Endurance</option>
          </select>
        </div>
      </div>
      <div id="plan-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Generate Plan</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  showModal('Generate Workout Plan', modalContent);
  document.getElementById('workout-plan-form')?.addEventListener('submit', handleGenerateWorkoutPlan);
}

async function handleGenerateWorkoutPlan(e) {
  e.preventDefault();
  const errorEl = document.getElementById('plan-error');
  if (errorEl) errorEl.textContent = '';

  try {
    const days = parseInt(document.getElementById('plan-days')?.value);
    const goal = document.getElementById('plan-goal')?.value;

    const result = await api.generateWorkoutPlan({
      days_per_week: days,
      goal: goal
    });

    closeModal();
    displayWorkoutPlan(result);
  } catch (error) {
    console.error('Error generating workout plan:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to generate workout plan';
    }
  }
}

function displayWorkoutPlan(plan) {
  const resultsEl = document.getElementById('ai-results');
  if (!resultsEl) return;

  const planHtml = `
    <div class="workout-card">
      <h3>Your ${plan.days_per_week}-Day Workout Plan ({plan.goal})</h3>
      ${plan.plan?.map(day => `
        <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
          <h4>Day ${day.day}</h4>
          <div class="exercise-list">
            ${day.exercises?.map(ex => `
              <div class="exercise-item">
                <div>
                  <div class="exercise-name">${ex.name}</div>
                  <div class="exercise-details">${ex.sets} sets × ${ex.reps} reps</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  resultsEl.innerHTML = planHtml;
}

function showFreestyleModal() {
  const modalContent = `
    <form id="freestyle-form">
      <div class="form-row">
        <div class="form-group">
          <label>Duration (minutes)</label>
          <input type="number" id="freestyle-duration" min="10" value="30" required>
        </div>
        <div class="form-group">
          <label>Intensity</label>
          <select id="freestyle-intensity" required>
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div id="freestyle-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Generate Workout</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  showModal('Generate Freestyle Workout', modalContent);
  document.getElementById('freestyle-form')?.addEventListener('submit', handleGenerateFreestyle);
}

async function handleGenerateFreestyle(e) {
  e.preventDefault();
  const errorEl = document.getElementById('freestyle-error');
  if (errorEl) errorEl.textContent = '';

  try {
    const duration = parseInt(document.getElementById('freestyle-duration')?.value);
    const intensity = document.getElementById('freestyle-intensity')?.value;

    const result = await api.generateFreestyle({
      duration_minutes: duration,
      intensity: intensity
    });

    closeModal();
    displayFreestyle(result);
  } catch (error) {
    console.error('Error generating freestyle workout:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to generate workout';
    }
  }
}

function displayFreestyle(workout) {
  const resultsEl = document.getElementById('ai-results');
  if (!resultsEl) return;

  const workoutHtml = `
    <div class="workout-card">
      <h3>Freestyle Circuit Workout</h3>
      <p><strong>Duration:</strong> ${workout.duration_minutes} minutes</p>
      <p><strong>Intensity:</strong> ${workout.intensity}</p>
      <p><strong>Rounds:</strong> ${workout.rounds}</p>
      <div class="exercise-list" style="margin-top: 1rem;">
        ${workout.circuit?.map(ex => `
          <div class="exercise-item">
            <div>
              <div class="exercise-name">${ex.name}</div>
              <div class="exercise-details">${ex.reps} reps</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  resultsEl.innerHTML = workoutHtml;
}

function showRecipeModal() {
  const modalContent = `
    <form id="recipe-form">
      <div class="form-group">
        <label>Target Calories</label>
        <input type="number" id="recipe-kcal" min="100" value="600" required>
      </div>
      <div id="recipe-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Generate Recipe</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  showModal('Generate AI Recipe', modalContent);
  document.getElementById('recipe-form')?.addEventListener('submit', handleGenerateRecipe);
}

async function handleGenerateRecipe(e) {
  e.preventDefault();
  const errorEl = document.getElementById('recipe-error');
  if (errorEl) errorEl.textContent = '';

  try {
    const targetKcal = parseInt(document.getElementById('recipe-kcal')?.value);

    const result = await api.generateRecipes({
      target_kcal: targetKcal
    });

    closeModal();
    displayRecipe(result);
  } catch (error) {
    console.error('Error generating recipe:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to generate recipe';
    }
  }
}

function displayRecipe(recipe) {
  const resultsEl = document.getElementById('ai-results');
  if (!resultsEl) return;

  const recipeHtml = `
    <div class="workout-card">
      <h3>Meal Recipe (${recipe.target_kcal} kcal target)</h3>
      <div class="exercise-list" style="margin-top: 1rem;">
        ${recipe.items?.map(item => `
          <div class="exercise-item">
            <div>
              <div class="exercise-name">${item.name}</div>
              <div class="exercise-details">Quantity: ${item.quantity}x | ${(item.kcal * item.quantity).toFixed(0)} kcal</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="meal-totals" style="margin-top: 1rem;">
        <span>Total: ${recipe.totals?.kcal.toFixed(0)} kcal</span>
        <span>Protein: ${recipe.totals?.protein.toFixed(1)}g</span>
        <span>Carbs: ${recipe.totals?.carbs.toFixed(1)}g</span>
        <span>Fat: ${recipe.totals?.fat.toFixed(1)}g</span>
      </div>
    </div>
  `;

  resultsEl.innerHTML = recipeHtml;
}
