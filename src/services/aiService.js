// AI Service - Workout plan generation and display functions

export function generateStructuredWorkoutPlan(days, goal, exercises) {
  const muscleGroupMap = {
    'chest': 'chest',
    'pectorals': 'chest',
    'pecs': 'chest',
    'pectoral': 'chest',
    'triceps': 'triceps',
    'tricep': 'triceps',
    'back': 'back',
    'lats': 'back',
    'latissimus': 'back',
    'lats dorsi': 'back',
    'rear delts': 'back',
    'biceps': 'biceps',
    'bicep': 'biceps',
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
    'shoulders': 'shoulders',
    'shoulder': 'shoulders',
    'deltoids': 'shoulders',
    'delts': 'shoulders',
    'deltoid': 'shoulders',
    'core': 'core',
    'abs': 'core',
    'abdominals': 'core',
    'abdominal': 'core',
    'cardio': null,
    'full body': null
  }

  const keywordGroups = {
    chest: ['chest', 'pectoral', 'bench', 'push-up', 'dumbbell press', 'chest press', 'fly', 'pec'],
    triceps: ['tricep', 'triceps', 'dip', 'extension', 'pushdown'],
    back: ['back', 'lat', 'pull', 'row', 'pull-up', 'chin-up', 'lat pulldown', 'barbell row'],
    biceps: ['bicep', 'biceps', 'curl', 'hammer'],
    legs: ['leg', 'squat', 'lunge', 'leg press', 'calf', 'quad', 'hamstring', 'glute'],
    shoulders: ['shoulder', 'deltoid', 'lateral raise', 'front raise', 'rear delt'],
    core: ['core', 'ab', 'crunch', 'plank', 'sit-up', 'russian twist']
  }

  const categorizedExercises = {
    chest: [],
    triceps: [],
    back: [],
    biceps: [],
    legs: [],
    shoulders: [],
    core: []
  }

  exercises.forEach(ex => {
    const muscleGroup = ex.primary_muscle || ex.muscle_group || ex.category || 
                       ex.primary_muscle_group || ex.muscle || ex.target_muscle
    
    let assignedGroup = null
    
    if (muscleGroup) {
      const normalized = String(muscleGroup).toLowerCase().trim()
      assignedGroup = muscleGroupMap[normalized]
      
      if (assignedGroup === null) {
        return
      }
    }
    
    if (!assignedGroup) {
      const exName = (ex.name || ex.exercise_name || ex.exercise || '').toLowerCase()
      
      for (const [group, keywords] of Object.entries(keywordGroups)) {
        if (keywords.some(keyword => exName.includes(keyword))) {
          assignedGroup = group
          break
        }
      }
    }
    
    const finalGroup = assignedGroup || 'legs'
    if (categorizedExercises[finalGroup]) {
      categorizedExercises[finalGroup].push(ex)
    }
  })

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
  }

  const split = splits[days] || splits[3]
  
  const repRanges = {
    strength: { sets: 4, reps: 6 },
    endurance: { sets: 3, reps: 15 },
    balanced: { sets: 3, reps: 10 }
  }
  const { sets, reps } = repRanges[goal] || repRanges.balanced

  const planDays = split.map((daySplit, index) => {
    const dayExercises = []
    const usedExerciseIds = new Set()
    const usedExerciseNames = new Set()
    
    daySplit.groups.forEach(group => {
      const groupExercises = categorizedExercises[group] || []
      const shuffled = [...groupExercises].sort(() => Math.random() - 0.5)
      
      let added = 0
      const maxPerGroup = group === 'legs' ? 4 : 3
      
      for (const ex of shuffled) {
        if (added >= maxPerGroup) break
        
        const exerciseId = ex.exercise_id || ex.id
        const exerciseName = ex.name || ex.exercise_name || ex.exercise || 'Exercise'
        const normalizedName = exerciseName.toLowerCase().trim()
        
        const alreadyUsed = exerciseId 
          ? usedExerciseIds.has(exerciseId) 
          : usedExerciseNames.has(normalizedName)
        
        if (!alreadyUsed) {
          if (exerciseId) {
            usedExerciseIds.add(exerciseId)
          }
          usedExerciseNames.add(normalizedName)
          dayExercises.push({
            name: exerciseName,
            sets: sets,
            reps: reps
          })
          added++
        }
      }
    })

    return {
      day: index + 1,
      day_name: daySplit.name,
      exercises: dayExercises
    }
  })

  return {
    days_per_week: days,
    goal: goal,
    plan: planDays
  }
}

export function displayWorkoutPlan(plan) {
  const daysPerWeek = plan.days_per_week || 3
  const goal = plan.goal || 'balanced'
  const planDays = plan.plan || plan.workout_plan || plan.days || plan.workout_days || []

  if (!planDays || planDays.length === 0) {
    return `
      <div class="workout-card">
        <h3>Error</h3>
        <p>No workout plan data received.</p>
      </div>
    `
  }

  return `
    <div class="workout-card">
      <h3>Your ${daysPerWeek}-Day Workout Plan (${goal})</h3>
      ${planDays.map((day, index) => {
        const dayNumber = day.day || day.day_number || index + 1
        const exercises = day.exercises || day.exercise_list || []
        const dayName = day.day_name || ''
        return `
          <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
            <h4>Day ${dayNumber}${dayName ? ` - ${dayName}` : ''}</h4>
            <div class="exercise-list">
              ${exercises.length > 0 ? exercises.map(ex => {
                const exerciseName = ex.name || ex.exercise_name || ex.exercise || 'Exercise'
                const sets = ex.sets || 0
                const reps = ex.reps || 0
                return `
                  <div class="exercise-item">
                    <div>
                      <div class="exercise-name">${exerciseName}</div>
                      <div class="exercise-details">${sets} sets × ${reps} reps</div>
                    </div>
                  </div>
                `
              }).join('') : '<p>No exercises for this day</p>'}
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}

export function displayFreestyle(workout) {
  return `
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
  `
}

export function displayRecipe(recipe) {
  return `
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
  `
}
