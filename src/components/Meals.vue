<template>
  <div class="page-content">
    <div class="page-header">
      <h2>Meals</h2>
      <button class="btn-primary" @click="showCreateModal">➕ Log Meal</button>
    </div>
    <div v-if="loading" style="text-align: center; padding: 2rem;">Loading...</div>
    <div v-else-if="meals.length === 0" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
      No meals logged yet. Log your first meal!
    </div>
    <div v-else class="meals-list">
      <div v-for="meal in meals" :key="meal.meal_id" class="meal-card">
        <div class="workout-header">
          <div class="workout-date">{{ formatDate(meal.date) }}</div>
          <button class="btn-danger" @click="deleteMeal(meal.meal_id)">Delete</button>
        </div>
        <div class="exercise-list">
          <div v-for="item in meal.meal_items || meal.mealitems || []" :key="item.meal_item_id || item.id" class="exercise-item">
            <div>
              <div class="exercise-name">{{ (item.foods || item.food || {}).name || 'Food' }}</div>
              <div class="exercise-details">
                {{ item.quantity }}g ({{ (item.foods || item.food || {}).kcal || 0 }} kcal per 100g) | 
                Total: {{ calculateItemKcal(item) }} kcal
              </div>
            </div>
          </div>
        </div>
        <div class="meal-totals">
          <span>Total: {{ calculateTotals(meal).kcal.toFixed(0) }} kcal</span>
          <span>Protein: {{ calculateTotals(meal).protein.toFixed(1) }}g</span>
          <span>Carbs: {{ calculateTotals(meal).carbs.toFixed(1) }}g</span>
          <span>Fat: {{ calculateTotals(meal).fat.toFixed(1) }}g</span>
        </div>
      </div>
    </div>

    <!-- Create Meal Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Log Meal</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleCreateMeal">
            <div class="form-group">
              <label>Date</label>
              <input type="date" v-model="newMeal.date" required>
            </div>
            <div v-for="(item, index) in newMeal.items" :key="index" class="exercise-form-item">
              <div class="form-row">
                <div class="form-group">
                  <label>Food</label>
                  <select v-model.number="item.food_id" required>
                    <option value="">Select food</option>
                    <option v-for="food in foods" :key="food.food_id || food.id" :value="food.food_id || food.id">
                      {{ food.name }} ({{ food.kcal }} kcal per 100g)
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Quantity (grams)</label>
                  <input type="number" v-model.number="item.quantity" min="0.1" step="0.1" required>
                </div>
                <div class="form-group" style="display: flex; align-items: flex-end;">
                  <button type="button" class="btn-danger" @click="removeFood(index)">Remove</button>
                </div>
              </div>
            </div>
            <div style="margin-top: 1rem;">
              <button type="button" class="btn-secondary" @click="addFood">➕ Add Food</button>
            </div>
            <div class="error-message">{{ error }}</div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
              <button type="submit" class="btn-primary">Log Meal</button>
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api, getCurrentUser } from '../services/api'

export default {
  name: 'Meals',
  setup() {
    const loading = ref(false)
    const meals = ref([])
    const foods = ref([])
    const showModal = ref(false)
    const error = ref('')
    const newMeal = ref({
      date: new Date().toISOString().split('T')[0],
      items: [{ food_id: null, quantity: 100 }]
    })

    const loadFoods = async () => {
      try {
        foods.value = await api.getFoods()
      } catch (err) {
        console.error('Error loading foods:', err)
        foods.value = []
      }
    }

    const loadMeals = async () => {
      loading.value = true
      const user = getCurrentUser()
      if (!user) return

      try {
        const allMeals = await api.getMeals()
        meals.value = allMeals
          .filter(m => m.user_id === user.user_id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      } catch (err) {
        console.error('Error loading meals:', err)
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    const calculateItemKcal = (item) => {
      const food = item.foods || item.food || {}
      const quantity = item.quantity || 0
      const kcalPer100g = food.kcal || 0
      return (kcalPer100g * quantity / 100).toFixed(0)
    }

    const calculateTotals = (meal) => {
      const mealItems = meal.meal_items || meal.mealitems || []
      if (mealItems.length === 0) {
        return { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      }

      return mealItems.reduce((total, item) => {
        const food = item.foods || item.food || {}
        const quantity = item.quantity || 0
        const multiplier = quantity / 100
        return {
          kcal: total.kcal + (food.kcal || 0) * multiplier,
          protein: total.protein + (food.protein || 0) * multiplier,
          carbs: total.carbs + (food.carbs || 0) * multiplier,
          fat: total.fat + (food.fat || 0) * multiplier
        }
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })
    }

    const showCreateModal = () => {
      if (foods.value.length === 0) {
        loadFoods().then(() => {
          showModal.value = true
        })
      } else {
        showModal.value = true
      }
    }

    const closeModal = () => {
      showModal.value = false
      error.value = ''
      newMeal.value = {
        date: new Date().toISOString().split('T')[0],
        items: [{ food_id: null, quantity: 100 }]
      }
    }

    const addFood = () => {
      newMeal.value.items.push({ food_id: null, quantity: 100 })
    }

    const removeFood = (index) => {
      newMeal.value.items.splice(index, 1)
    }

    const handleCreateMeal = async () => {
      error.value = ''
      if (newMeal.value.items.length === 0) {
        error.value = 'Please add at least one food item'
        return
      }

      try {
        await api.createMeal({
          date: newMeal.value.date,
          items: newMeal.value.items
        })
        closeModal()
        await loadMeals()
      } catch (err) {
        error.value = err.message || 'Failed to create meal'
      }
    }

    const deleteMeal = async (mealId) => {
      if (!confirm('Delete this meal?')) return
      try {
        await api.deleteMeal(mealId)
        await loadMeals()
      } catch (err) {
        alert('Failed to delete meal')
      }
    }

    onMounted(async () => {
      await loadFoods()
      await loadMeals()
    })

    return {
      loading,
      meals,
      foods,
      showModal,
      error,
      newMeal,
      formatDate,
      calculateItemKcal,
      calculateTotals,
      showCreateModal,
      closeModal,
      addFood,
      removeFood,
      handleCreateMeal,
      deleteMeal
    }
  }
}
</script>
