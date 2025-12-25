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
      <div v-for="dayGroup in groupedMealsByDate" :key="dayGroup.date" class="meal-card day-column">
        <div class="workout-header">
          <div class="workout-date">{{ formatDate(dayGroup.date) }}</div>
          <div class="header-actions">
            <button 
              class="expand-btn" 
              @click="toggleExpand(dayGroup.dateKey)"
              :class="{ 'expanded': expandedDays[dayGroup.dateKey] }"
              :title="expandedDays[dayGroup.dateKey] ? 'Collapse' : 'Expand'"
            >
              <span class="arrow-icon">{{ expandedDays[dayGroup.dateKey] ? '▼' : '▲' }}</span>
            </button>
            <button 
              class="btn-danger" 
              @click="deleteDayMeals(dayGroup.meals)"
            >
              Delete
            </button>
          </div>
        </div>
        <div class="day-totals">
          <span class="total-calories">{{ calculateDayTotals(dayGroup).kcal.toFixed(0) }} kcal</span>
          <span class="total-macro">P: {{ calculateDayTotals(dayGroup).protein.toFixed(1) }}g</span>
          <span class="total-macro">C: {{ calculateDayTotals(dayGroup).carbs.toFixed(1) }}g</span>
          <span class="total-macro">F: {{ calculateDayTotals(dayGroup).fat.toFixed(1) }}g</span>
        </div>
        <div v-if="expandedDays[dayGroup.dateKey]" class="food-items-expanded">
          <div 
            v-for="meal in dayGroup.meals" 
            :key="meal.meal_id"
            class="meal-group"
          >
            <div 
              v-for="item in meal.meal_items || meal.mealitems || []" 
              :key="item.meal_item_id || item.id" 
              class="food-item"
            >
              <div class="food-name">
                {{ item.quantity }}g of {{ (item.foods || item.food || {}).name || 'Food' }}
              </div>
              <div class="food-item-right">
                <div class="food-macros">
                  {{ formatItemMacros(item) }}
                </div>
                <button 
                  class="btn-danger btn-small" 
                  @click="deleteMealItem(meal.meal_id, item.meal_item_id || item.id, meal)"
                  title="Delete this food item"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
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
import { ref, onMounted, computed } from 'vue'
import { api, getCurrentUser } from '../services/api'

export default {
  name: 'Meals',
  setup() {
    const loading = ref(false)
    const meals = ref([])
    const foods = ref([])
    const showModal = ref(false)
    const error = ref('')
    const expandedDays = ref({})
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

    const groupedMealsByDate = computed(() => {
      const grouped = {}
      meals.value.forEach(meal => {
        const dateKey = meal.date ? new Date(meal.date).toISOString().split('T')[0] : 'no-date'
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: meal.date || dateKey,
            dateKey: dateKey,
            meals: []
          }
        }
        grouped[dateKey].meals.push(meal)
      })
      return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const toggleExpand = (dateKey) => {
      expandedDays.value[dateKey] = !expandedDays.value[dateKey]
    }

    const calculateDayTotals = (dayGroup) => {
      return dayGroup.meals.reduce((dayTotal, meal) => {
        const mealTotal = calculateTotals(meal)
        return {
          kcal: dayTotal.kcal + mealTotal.kcal,
          protein: dayTotal.protein + mealTotal.protein,
          carbs: dayTotal.carbs + mealTotal.carbs,
          fat: dayTotal.fat + mealTotal.fat
        }
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })
    }

    const formatItemMacros = (item) => {
      const food = item.foods || item.food || {}
      const quantity = item.quantity || 0
      const multiplier = quantity / 100
      const cal = Math.round((food.kcal || 0) * multiplier)
      const protein = ((food.protein || 0) * multiplier).toFixed(1)
      const carbs = ((food.carbs || 0) * multiplier).toFixed(1)
      const fat = ((food.fat || 0) * multiplier).toFixed(1)
      return `${cal} kcal| ${protein}P/${carbs}C/${fat}F`
    }

    const deleteDayMeals = async (dayMeals) => {
      if (!confirm(`Delete all meals for this day?`)) return
      try {
        const deletePromises = dayMeals.map(meal => api.deleteMeal(meal.meal_id))
        await Promise.all(deletePromises)
        await loadMeals()
      } catch (err) {
        alert('Failed to delete meals')
      }
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

    const deleteMealItem = async (mealId, itemId, meal) => {
      const food = (meal.meal_items || meal.mealitems || []).find(item => 
        (item.meal_item_id || item.id) === itemId
      )
      const foodName = (food?.foods || food?.food || {}).name || 'this food item'
      if (!confirm(`Delete ${foodName} from this meal?`)) return
      
      try {
        await api.deleteMealItem(mealId, itemId)
        await loadMeals()
      } catch (err) {
        alert('Failed to delete food item')
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
      expandedDays,
      groupedMealsByDate,
      formatDate,
      calculateItemKcal,
      calculateTotals,
      calculateDayTotals,
      formatItemMacros,
      toggleExpand,
      deleteDayMeals,
      showCreateModal,
      closeModal,
      addFood,
      removeFood,
      handleCreateMeal,
      deleteMeal,
      deleteMealItem
    }
  }
}
</script>

<style scoped>
.day-column {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-btn {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: all 0.2s;
  min-width: 2.5rem;
  min-height: 2.5rem;
  border-radius: 6px;
  font-size: 1rem;
}

.expand-btn:hover {
  background: var(--accent-green-light);
  border-color: var(--accent-green);
  transform: scale(1.05);
}

.expand-btn.expanded .arrow-icon {
  transform: rotate(0deg);
}

.arrow-icon {
  font-size: 1.3rem;
  font-weight: bold;
  transition: transform 0.2s;
  display: inline-block;
  user-select: none;
  line-height: 1;
  color: var(--accent-green);
}

.day-totals {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  font-weight: 600;
  flex-wrap: wrap;
}

.total-calories {
  font-size: 1.2rem;
  color: var(--accent-green);
}

.total-macro {
  color: var(--text-primary);
  font-size: 1rem;
}

.food-items-expanded {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--border-color);
}

.meal-group {
  margin-bottom: 1rem;
}

.food-item {
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.food-name {
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.food-item-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.food-macros {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}
</style>
