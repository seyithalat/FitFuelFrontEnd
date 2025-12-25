<template>
  <div class="page-content">
    <div class="page-header">
      <h2>AI Tools</h2>
    </div>
    <div class="dashboard-grid">
      <div class="stat-card" style="cursor: pointer;" @click="handleTool('workout-plan')">
        <div class="stat-icon">💪</div>
        <div class="stat-info">
          <h3>Workout Plan</h3>
          <p>Generate a personalized weekly workout plan</p>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" @click="handleTool('freestyle')">
        <div class="stat-icon">🔥</div>
        <div class="stat-info">
          <h3>Freestyle Workout</h3>
          <p>Get a random circuit workout</p>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" @click="handleTool('recipes')">
        <div class="stat-icon">🍳</div>
        <div class="stat-info">
          <h3>AI Recipe</h3>
          <p>Generate a meal recipe based on calories</p>
        </div>
      </div>
    </div>
    <div id="ai-results" style="margin-top: 2rem;" v-html="results"></div>

    <!-- Workout Plan Modal -->
    <div v-if="showWorkoutPlanModal" class="modal-overlay" @click.self="closeWorkoutPlanModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Generate Workout Plan</h3>
          <button class="modal-close" @click="closeWorkoutPlanModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="generateWorkoutPlan">
            <div class="form-row">
              <div class="form-group">
                <label>Days per Week</label>
                <input type="number" v-model.number="workoutPlanForm.days" min="1" max="6" required>
              </div>
              <div class="form-group">
                <label>Goal</label>
                <select v-model="workoutPlanForm.goal" required>
                  <option value="balanced">Balanced</option>
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
            </div>
            <div class="error-message">{{ error }}</div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
              <button type="submit" class="btn-primary">Generate Plan</button>
              <button type="button" class="btn-secondary" @click="closeWorkoutPlanModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Freestyle Modal -->
    <div v-if="showFreestyleModal" class="modal-overlay" @click.self="closeFreestyleModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Generate Freestyle Workout</h3>
          <button class="modal-close" @click="closeFreestyleModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="generateFreestyle">
            <div class="form-row">
              <div class="form-group">
                <label>Duration (minutes)</label>
                <input type="number" v-model.number="freestyleForm.duration" min="10" required>
              </div>
              <div class="form-group">
                <label>Intensity</label>
                <select v-model="freestyleForm.intensity" required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div class="error-message">{{ error }}</div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
              <button type="submit" class="btn-primary">Generate Workout</button>
              <button type="button" class="btn-secondary" @click="closeFreestyleModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Recipe Modal -->
    <div v-if="showRecipeModal" class="modal-overlay" @click.self="closeRecipeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Generate AI Recipe</h3>
          <button class="modal-close" @click="closeRecipeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="generateRecipe">
            <div class="form-group">
              <label>Target Calories</label>
              <input type="number" v-model.number="recipeForm.targetKcal" min="100" required>
            </div>
            <div class="error-message">{{ error }}</div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
              <button type="submit" class="btn-primary">Generate Recipe</button>
              <button type="button" class="btn-secondary" @click="closeRecipeModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { api } from '../services/api'
import { getCurrentUser } from '../services/api'
import { generateStructuredWorkoutPlan, displayWorkoutPlan, displayFreestyle, displayRecipe } from '../services/aiService.js'

export default {
  name: 'AI',
  setup() {
    const results = ref('')
    const error = ref('')
    const showWorkoutPlanModal = ref(false)
    const showFreestyleModal = ref(false)
    const showRecipeModal = ref(false)
    const workoutPlanForm = ref({ days: 3, goal: 'balanced' })
    const freestyleForm = ref({ duration: 30, intensity: 'medium' })
    const recipeForm = ref({ targetKcal: 600 })
    const currentRecipe = ref(null) // Store the current recipe data

    const handleTool = (tool) => {
      error.value = ''
      results.value = ''
      if (tool === 'workout-plan') {
        showWorkoutPlanModal.value = true
      } else if (tool === 'freestyle') {
        showFreestyleModal.value = true
      } else if (tool === 'recipes') {
        showRecipeModal.value = true
      }
    }

    const closeWorkoutPlanModal = () => {
      showWorkoutPlanModal.value = false
      error.value = ''
    }

    const closeFreestyleModal = () => {
      showFreestyleModal.value = false
      error.value = ''
    }

    const closeRecipeModal = () => {
      showRecipeModal.value = false
      error.value = ''
    }

    const generateWorkoutPlan = async () => {
      error.value = ''
      try {
        const exercises = await api.getExercises()
        const plan = generateStructuredWorkoutPlan(workoutPlanForm.value.days, workoutPlanForm.value.goal, exercises)
        closeWorkoutPlanModal()
        results.value = displayWorkoutPlan(plan)
      } catch (err) {
        error.value = err.message || 'Failed to generate workout plan'
      }
    }

    const generateFreestyle = async () => {
      error.value = ''
      try {
        const result = await api.generateFreestyle({
          duration_minutes: freestyleForm.value.duration,
          intensity: freestyleForm.value.intensity
        })
        closeFreestyleModal()
        results.value = displayFreestyle(result)
      } catch (err) {
        error.value = err.message || 'Failed to generate workout'
      }
    }

    const generateRecipe = async () => {
      error.value = ''
      try {
        const result = await api.generateRecipes({
          target_kcal: recipeForm.value.targetKcal
        })
        currentRecipe.value = result // Store recipe data
        closeRecipeModal()
        results.value = displayRecipe(result)
      } catch (err) {
        error.value = err.message || 'Failed to generate recipe'
      }
    }

    const addRecipeToMeals = async () => {
      if (!currentRecipe.value || !currentRecipe.value.items) {
        error.value = 'No recipe to add'
        return
      }

      const user = getCurrentUser()
      if (!user) {
        error.value = 'Please log in to add meals'
        return
      }

      error.value = ''
      try {
        // Transform recipe items to meal items format
        const mealItems = currentRecipe.value.items.map(item => ({
          food_id: item.food_id,
          quantity: item.quantity
        }))

        // Create meal with today's date
        await api.createMeal({
          items: mealItems,
          date: new Date().toISOString()
        })

        // Show success message
        const successMsg = document.createElement('div')
        successMsg.className = 'success-message'
        successMsg.style.cssText = 'background: #4caf50; color: white; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;'
        successMsg.textContent = '✓ Meal added successfully!'
        
        const resultsDiv = document.getElementById('ai-results')
        if (resultsDiv) {
          resultsDiv.appendChild(successMsg)
          setTimeout(() => {
            successMsg.remove()
          }, 3000)
        }
      } catch (err) {
        error.value = err.message || 'Failed to add meal'
      }
    }

    // Handle clicks on the "Add to Meals" button using event delegation
    const handleResultsClick = (e) => {
      if (e.target && e.target.classList.contains('add-to-meals-btn')) {
        e.preventDefault()
        addRecipeToMeals()
      }
    }

    // Watch for results changes and re-attach event listener
    watch(results, async () => {
      await nextTick()
      const resultsDiv = document.getElementById('ai-results')
      if (resultsDiv) {
        // Remove old listener if any
        resultsDiv.removeEventListener('click', handleResultsClick)
        // Add new listener
        resultsDiv.addEventListener('click', handleResultsClick)
      }
    })

    onMounted(() => {
      const resultsDiv = document.getElementById('ai-results')
      if (resultsDiv) {
        resultsDiv.addEventListener('click', handleResultsClick)
      }
    })

    onUnmounted(() => {
      const resultsDiv = document.getElementById('ai-results')
      if (resultsDiv) {
        resultsDiv.removeEventListener('click', handleResultsClick)
      }
    })

    return {
      results,
      error,
      showWorkoutPlanModal,
      showFreestyleModal,
      showRecipeModal,
      workoutPlanForm,
      freestyleForm,
      recipeForm,
      handleTool,
      closeWorkoutPlanModal,
      closeFreestyleModal,
      closeRecipeModal,
      generateWorkoutPlan,
      generateFreestyle,
      generateRecipe,
      addRecipeToMeals
    }
  }
}
</script>
