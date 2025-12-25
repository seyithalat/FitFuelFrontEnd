<template>
  <div class="page-content">
    <div class="page-header">
      <h2>Preferences</h2>
    </div>
    <div v-if="loading" style="text-align: center; padding: 2rem;">Loading...</div>
    <div v-else class="preferences-content">
      <form @submit.prevent="handleSave" style="max-width: 800px;">
        <div class="workout-card" style="margin-bottom: 1.5rem;">
          <h3 style="margin-bottom: 1rem;">Calorie & Macro Targets</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Daily Calorie Target</label>
              <input type="number" v-model.number="preferences.kcal_target" min="1000" max="10000" required @input="onCaloriesChange">
            </div>
            <div class="form-group">
              <label>Diet Type</label>
              <select v-model="preferences.diet_type" @change="calculateMacros" required>
                <option value="balanced">Balanced</option>
                <option value="high_protein">High Protein</option>
                <option value="low_carb">Low Carb</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div class="form-group">
              <label>Protein (g)</label>
              <input type="number" v-model.number="preferences.macros.protein" min="0" required :readonly="preferences.diet_type !== 'custom'">
            </div>
            <div class="form-group">
              <label>Carbs (g)</label>
              <input type="number" v-model.number="preferences.macros.carbs" min="0" required :readonly="preferences.diet_type !== 'custom'">
            </div>
            <div class="form-group">
              <label>Fat (g)</label>
              <input type="number" v-model.number="preferences.macros.fat" min="0" required :readonly="preferences.diet_type !== 'custom'">
            </div>
            <div class="form-group">
              <label>Workout Days/Week</label>
              <input type="number" v-model.number="preferences.days_per_week" min="1" max="7" required>
            </div>
          </div>
        </div>

        <div class="workout-card" style="margin-bottom: 1.5rem;">
          <h3 style="margin-bottom: 1rem;">Liked Exercises</h3>
          <div class="form-row" style="margin-bottom: 1rem;">
            <div class="form-group" style="flex: 1;">
              <input type="text" v-model="newExercise" placeholder="Exercise name" @keyup.enter.prevent="addLikedExercise">
            </div>
            <div class="form-group">
              <button type="button" class="btn-secondary" @click="addLikedExercise">Add</button>
            </div>
          </div>
          <div class="exercise-list">
            <div v-if="preferences.liked_exercises.length === 0" style="color: var(--text-secondary);">
              No liked exercises
            </div>
            <div v-for="(exercise, index) in preferences.liked_exercises" :key="index" class="exercise-item">
              <span>{{ exercise }}</span>
              <button type="button" class="btn-danger" @click="removeLikedExercise(index)">Remove</button>
            </div>
          </div>
        </div>

        <div class="workout-card" style="margin-bottom: 1.5rem;">
          <h3 style="margin-bottom: 1rem;">Disliked Foods</h3>
          <div class="form-row" style="margin-bottom: 1rem;">
            <div class="form-group" style="flex: 1;">
              <input type="text" v-model="newDislikedFood" placeholder="Food name" @keyup.enter.prevent="addDislikedFood">
            </div>
            <div class="form-group">
              <button type="button" class="btn-secondary" @click="addDislikedFood">Add</button>
            </div>
          </div>
          <div class="exercise-list">
            <div v-if="preferences.disliked_foods.length === 0" style="color: var(--text-secondary);">
              No disliked foods
            </div>
            <div v-for="(food, index) in preferences.disliked_foods" :key="index" class="exercise-item">
              <span>{{ food }}</span>
              <button type="button" class="btn-danger" @click="removeDislikedFood(index)">Remove</button>
            </div>
          </div>
        </div>

        <div class="error-message" :style="{ color: saveMessage.includes('successfully') ? 'var(--success)' : 'var(--error)' }">
          {{ saveMessage }}
        </div>
        <button type="submit" class="btn-primary">Save Preferences</button>
      </form>

      <div class="workout-card" style="margin-top: 2rem; border: 2px solid var(--error);">
        <h3 style="color: var(--error); margin-bottom: 1rem;">Danger Zone</h3>
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">
          Permanently delete your account. This action cannot be undone.
        </p>
        <button type="button" class="btn-danger" @click="deleteOwnAccount">
          Delete My Account
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api, getCurrentUser } from '../services/api'

export default {
  name: 'Preferences',
  setup() {
    const loading = ref(false)
    const preferences = ref({
      kcal_target: 2000,
      macros: { protein: 120, carbs: 200, fat: 70 },
      liked_exercises: [],
      disliked_foods: [],
      days_per_week: 3,
      diet_type: 'balanced'
    })
    const newExercise = ref('')
    const newDislikedFood = ref('')
    const saveMessage = ref('')

    const calculateMacros = () => {
      const kcal = preferences.value.kcal_target || 2000
      const dietType = preferences.value.diet_type

      // Calorie conversions: 4 cal/g for protein and carbs, 9 cal/g for fats
      if (dietType === 'high_protein') {
        // 45% protein, 30% carbs, 25% fats
        const proteinCal = kcal * 0.45
        const carbsCal = kcal * 0.30
        const fatCal = kcal * 0.25
        preferences.value.macros.protein = Math.round(proteinCal / 4)
        preferences.value.macros.carbs = Math.round(carbsCal / 4)
        preferences.value.macros.fat = Math.round(fatCal / 9)
      } else if (dietType === 'low_carb') {
        // 15% carbs, 35% protein, 50% fats
        const carbsCal = kcal * 0.15
        const proteinCal = kcal * 0.35
        const fatCal = kcal * 0.50
        preferences.value.macros.carbs = Math.round(carbsCal / 4)
        preferences.value.macros.protein = Math.round(proteinCal / 4)
        preferences.value.macros.fat = Math.round(fatCal / 9)
      } else if (dietType === 'balanced') {
        // Default balanced: 30% protein, 40% carbs, 30% fats
        const proteinCal = kcal * 0.30
        const carbsCal = kcal * 0.40
        const fatCal = kcal * 0.30
        preferences.value.macros.protein = Math.round(proteinCal / 4)
        preferences.value.macros.carbs = Math.round(carbsCal / 4)
        preferences.value.macros.fat = Math.round(fatCal / 9)
      }
      // If 'custom', don't calculate - user enters manually
    }

    const onCaloriesChange = () => {
      // Recalculate macros if not in custom mode
      if (preferences.value.diet_type !== 'custom') {
        calculateMacros()
      }
    }

    const loadPreferences = async () => {
      loading.value = true
      const user = getCurrentUser()
      if (!user) return

      try {
        const data = await api.getPreferences(user.user_id)
        if (data.preferences) {
          preferences.value = {
            kcal_target: data.preferences.kcal_target || 2000,
            macros: data.preferences.macros || { protein: 120, carbs: 200, fat: 70 },
            liked_exercises: data.preferences.liked_exercises || [],
            disliked_foods: data.preferences.disliked_foods || [],
            days_per_week: data.preferences.days_per_week || 3,
            diet_type: data.preferences.diet_type || 'balanced'
          }
          // Calculate macros if not custom
          if (preferences.value.diet_type !== 'custom') {
            calculateMacros()
          }
        }
      } catch (err) {
        console.error('Error loading preferences:', err)
      } finally {
        loading.value = false
      }
    }

    const handleSave = async () => {
      saveMessage.value = ''
      const user = getCurrentUser()
      if (!user) return

      try {
        await api.updatePreferences(user.user_id, preferences.value)
        saveMessage.value = 'Preferences saved successfully!'
        setTimeout(() => {
          saveMessage.value = ''
        }, 3000)
      } catch (err) {
        saveMessage.value = err.message || 'Failed to save preferences'
      }
    }

    const addLikedExercise = () => {
      const exercise = newExercise.value.trim()
      if (exercise && !preferences.value.liked_exercises.includes(exercise)) {
        preferences.value.liked_exercises.push(exercise)
        newExercise.value = ''
      }
    }

    const removeLikedExercise = (index) => {
      preferences.value.liked_exercises.splice(index, 1)
    }

    const addDislikedFood = () => {
      const food = newDislikedFood.value.trim()
      if (food && !preferences.value.disliked_foods.includes(food)) {
        preferences.value.disliked_foods.push(food)
        newDislikedFood.value = ''
      }
    }

    const removeDislikedFood = (index) => {
      preferences.value.disliked_foods.splice(index, 1)
    }

    const deleteOwnAccount = async () => {
      if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
        return
      }

      if (!confirm('This is your last chance. Are you absolutely sure?')) {
        return
      }

      try {
        await api.deleteOwnAccount()
        alert('Your account has been deleted. You will be logged out.')
        localStorage.removeItem('token')
        window.location.reload()
      } catch (err) {
        alert('Failed to delete account: ' + (err.message || 'Unknown error'))
      }
    }

    onMounted(loadPreferences)

    return {
      loading,
      preferences,
      newExercise,
      newDislikedFood,
      saveMessage,
      handleSave,
      addLikedExercise,
      removeLikedExercise,
      addDislikedFood,
      removeDislikedFood,
      deleteOwnAccount,
      calculateMacros,
      onCaloriesChange
    }
  }
}
</script>

<style scoped>
input[readonly] {
  background-color: var(--bg-primary);
  cursor: not-allowed;
  opacity: 0.8;
}
</style>
