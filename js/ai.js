// AI Tools Module
import { api, getCurrentUser, API_BASE_URL } from './api.js';
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

    // Get available exercises from database
    const exercises = await api.getExercises();
    
    // Generate structured workout plan with proper muscle group splits
    const workoutPlan = generateStructuredWorkoutPlan(days, goal, exercises);

    closeModal();
    displayWorkoutPlan(workoutPlan);
  } catch (error) {
    console.error('Error generating workout plan:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to generate workout plan';
    }
  }
}

// Generate structured workout plan with proper muscle group splits
function generateStructuredWorkoutPlan(days, goal, exercises) {
  // Map database muscle group names to our standard groups
  const muscleGroupMap = {
    // Chest variations
    'chest': 'chest',
    'pectorals': 'chest',
    'pecs': 'chest',
    'pectoral': 'chest',
    // Triceps variations
    'triceps': 'triceps',
    'tricep': 'triceps',
    // Back variations
    'back': 'back',
    'lats': 'back',
    'latissimus': 'back',
    'lats dorsi': 'back',
    'rear delts': 'back',
    // Biceps variations
    'biceps': 'biceps',
    'bicep': 'biceps',
    // Legs variations
    'legs': 'legs',
    'leg': 'legs',
    'quadriceps': 'legs',
    'quads': 'legs',
    'hamstrings': 'legs',
    'hamstring': 'legs',
    'glutes': 'legs',
    'glute': 'legs',
    'calves': 'legs',
    'calf': 'legs',
    // Shoulders variations
    'shoulders': 'shoulders',
    'shoulder': 'shoulders',
    'deltoids': 'shoulders',
    'delts': 'shoulders',
    'deltoid': 'shoulders',
    // Core variations
    'core': 'core',
    'abs': 'core',
    'abdominals': 'core',
    'abdominal': 'core',
    // Cardio and Full Body are excluded from muscle group splits
    'cardio': null,
    'full body': null
  };

  // Keyword fallback for exercises without muscle group data
  const keywordGroups = {
    chest: ['chest', 'pectoral', 'bench', 'push-up', 'dumbbell press', 'chest press', 'fly', 'pec'],
    triceps: ['tricep', 'triceps', 'dip', 'extension', 'pushdown'],
    back: ['back', 'lat', 'pull', 'row', 'pull-up', 'chin-up', 'lat pulldown', 'barbell row'],
    biceps: ['bicep', 'biceps', 'curl', 'hammer'],
    legs: ['leg', 'squat', 'lunge', 'leg press', 'calf', 'quad', 'hamstring', 'glute'],
    shoulders: ['shoulder', 'deltoid', 'lateral raise', 'front raise', 'rear delt'],
    core: ['core', 'ab', 'crunch', 'plank', 'sit-up', 'russian twist']
  };

  // Categorize exercises by muscle group
  const categorizedExercises = {
    chest: [],
    triceps: [],
    back: [],
    biceps: [],
    legs: [],
    shoulders: [],
    core: []
  };

  exercises.forEach(ex => {
    // First, try to get muscle group from exercise data
    const muscleGroup = ex.primary_muscle || ex.muscle_group || ex.category || 
                       ex.primary_muscle_group || ex.muscle || ex.target_muscle;
    
    let assignedGroup = null;
    
    if (muscleGroup) {
      // Normalize muscle group name (handle capitalization and trim)
      const normalized = String(muscleGroup).toLowerCase().trim();
      assignedGroup = muscleGroupMap[normalized];
      
      // If mapped to null (Cardio/Full Body), skip this exercise for muscle group splits
      if (assignedGroup === null) {
        return; // Skip cardio/full body exercises
      }
    }
    
    // If no muscle group found in data, use keyword matching as fallback
    if (!assignedGroup) {
      const exName = (ex.name || ex.exercise_name || ex.exercise || '').toLowerCase();
      
      for (const [group, keywords] of Object.entries(keywordGroups)) {
        if (keywords.some(keyword => exName.includes(keyword))) {
          assignedGroup = group;
          break;
        }
      }
    }
    
    // Assign to group (default to legs if still not categorized)
    const finalGroup = assignedGroup || 'legs';
    if (categorizedExercises[finalGroup]) {
      categorizedExercises[finalGroup].push(ex);
    }
  });

  // Define workout splits based on number of days
  const splits = {
    3: [
      { name: 'Chest & Triceps', groups: ['chest', 'triceps'] },
      { name: 'Back & Biceps', groups: ['back', 'biceps'] },
      { name: 'Legs & Shoulders', groups: ['legs', 'shoulders'] }
    ],
    4: [
      { name: 'Chest & Triceps', groups: ['chest', 'triceps'] },
      { name: 'Back & Biceps', groups: ['back', 'biceps'] },
      { name: 'Legs', groups: ['legs'] },
      { name: 'Shoulders & Core', groups: ['shoulders', 'core'] }
    ],
    5: [
      { name: 'Chest & Triceps', groups: ['chest', 'triceps'] },
      { name: 'Back & Biceps', groups: ['back', 'biceps'] },
      { name: 'Legs', groups: ['legs'] },
      { name: 'Shoulders', groups: ['shoulders'] },
      { name: 'Full Body', groups: ['chest', 'back', 'legs', 'shoulders'] }
    ],
    6: [
      { name: 'Chest & Triceps', groups: ['chest', 'triceps'] },
      { name: 'Back & Biceps', groups: ['back', 'biceps'] },
      { name: 'Legs', groups: ['legs'] },
      { name: 'Shoulders & Core', groups: ['shoulders', 'core'] },
      { name: 'Upper Body', groups: ['chest', 'back', 'shoulders'] },
      { name: 'Lower Body & Core', groups: ['legs', 'core'] }
    ]
  };

  // Get the split for the number of days (default to 3-day split)
  const split = splits[days] || splits[3];
  
  // Determine sets and reps based on goal
  const repRanges = {
    strength: { sets: 4, reps: 6 },
    endurance: { sets: 3, reps: 15 },
    balanced: { sets: 3, reps: 10 }
  };
  const { sets, reps } = repRanges[goal] || repRanges.balanced;

  // Generate workout plan
  const planDays = split.map((daySplit, index) => {
    const dayExercises = [];
    const usedExerciseNames = new Set();
    
    daySplit.groups.forEach(group => {
      const groupExercises = categorizedExercises[group] || [];
      // Shuffle to get variety, then take exercises
      const shuffled = [...groupExercises].sort(() => Math.random() - 0.5);
      const exercisesToAdd = shuffled.slice(0, group === 'legs' ? 4 : 3);
      
      exercisesToAdd.forEach(ex => {
        const exerciseName = ex.name || ex.exercise_name || ex.exercise || 'Exercise';
        // Skip if we already have this exercise in this day
        if (!usedExerciseNames.has(exerciseName.toLowerCase())) {
          usedExerciseNames.add(exerciseName.toLowerCase());
          dayExercises.push({
            name: exerciseName,
            sets: sets,
            reps: reps
          });
        }
      });
    });

    return {
      day: index + 1,
      day_name: daySplit.name,
      exercises: dayExercises
    };
  });

  return {
    days_per_week: days,
    goal: goal,
    plan: planDays
  };
}

function displayWorkoutPlan(plan) {
  const resultsEl = document.getElementById('ai-results');
  if (!resultsEl) return;

  const daysPerWeek = plan.days_per_week || 3;
  const goal = plan.goal || 'balanced';
  // Get plan days from various possible property names
  const planDays = plan.plan || plan.workout_plan || plan.days || plan.workout_days || [];

  if (!planDays || planDays.length === 0) {
    resultsEl.innerHTML = `
      <div class="workout-card">
        <h3>Error</h3>
        <p>No workout plan data received.</p>
      </div>
    `;
    return;
  }

  const planHtml = `
    <div class="workout-card">
      <h3>Your ${daysPerWeek}-Day Workout Plan (${goal})</h3>
      ${planDays.map((day, index) => {
        // Get day number and exercises, with fallbacks
        const dayNumber = day.day || day.day_number || index + 1;
        const exercises = day.exercises || day.exercise_list || [];
        
        const dayName = day.day_name || '';
        return `
          <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
            <h4>Day ${dayNumber}${dayName ? ` - ${dayName}` : ''}</h4>
            <div class="exercise-list">
              ${exercises.length > 0 ? exercises.map(ex => {
                const exerciseName = ex.name || ex.exercise_name || ex.exercise || 'Exercise';
                const sets = ex.sets || 0;
                const reps = ex.reps || 0;
                return `
                  <div class="exercise-item">
                    <div>
                      <div class="exercise-name">${exerciseName}</div>
                      <div class="exercise-details">${sets} sets × ${reps} reps</div>
                    </div>
                  </div>
                `;
              }).join('') : '<p>No exercises for this day</p>'}
            </div>
          </div>
        `;
      }).join('')}
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
