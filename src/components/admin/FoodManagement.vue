<template>
  <div class="admin-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h2>Food Management</h2>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn-primary" @click="showAddModal">➕ Add Food</button>
        <button class="btn-secondary" @click="$emit('back')">← Back to Dashboard</button>
      </div>
    </div>
    <div class="workout-card">
      <div v-if="foods.length === 0">No foods found</div>
      <div v-for="food in foods" :key="food.food_id || food.id" class="exercise-item">
        <div style="flex: 1;">
          <div class="exercise-name">{{ food.name || 'Unknown' }}</div>
          <div class="exercise-details">
            {{ food.kcal || 0 }} kcal per 100g | 
            Protein: {{ food.protein || 0 }}g | 
            Carbs: {{ food.carbs || 0 }}g | 
            Fat: {{ food.fat || 0 }}g
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-secondary" @click="editFood(food)">Edit</button>
          <button class="btn-danger" @click="deleteFood(food)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Food Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingFood.food_id ? 'Edit' : 'Add' }} Food</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <div class="form-group">
              <label>Food Name</label>
              <input type="text" v-model="editingFood.name" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Calories (per 100g)</label>
                <input type="number" v-model.number="editingFood.kcal" min="0" step="0.1" required>
              </div>
              <div class="form-group">
                <label>Protein (g per 100g)</label>
                <input type="number" v-model.number="editingFood.protein" min="0" step="0.1" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Carbs (g per 100g)</label>
                <input type="number" v-model.number="editingFood.carbs" min="0" step="0.1" required>
              </div>
              <div class="form-group">
                <label>Fat (g per 100g)</label>
                <input type="number" v-model.number="editingFood.fat" min="0" step="0.1" required>
              </div>
            </div>
            <div class="error-message">{{ error }}</div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
              <button type="submit" class="btn-primary">Save</button>
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
import { api } from '../../services/api'

export default {
  name: 'FoodManagement',
  emits: ['back'],
  setup() {
    const foods = ref([])
    const showModal = ref(false)
    const editingFood = ref({ name: '', kcal: 0, protein: 0, carbs: 0, fat: 0 })
    const error = ref('')

    const loadFoods = async () => {
      try {
        foods.value = await api.getFoods()
      } catch (err) {
        console.error('Error loading foods:', err)
      }
    }

    const showAddModal = () => {
      editingFood.value = { name: '', kcal: 0, protein: 0, carbs: 0, fat: 0 }
      showModal.value = true
    }

    const editFood = (food) => {
      editingFood.value = { ...food }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingFood.value = { name: '', kcal: 0, protein: 0, carbs: 0, fat: 0 }
      error.value = ''
    }

    const handleSave = async () => {
      error.value = ''
      try {
        if (editingFood.value.food_id) {
          await api.updateAdminFood(editingFood.value.food_id, {
            name: editingFood.value.name,
            kcal: editingFood.value.kcal,
            protein: editingFood.value.protein,
            carbs: editingFood.value.carbs,
            fat: editingFood.value.fat
          })
        } else {
          await api.createAdminFood({
            name: editingFood.value.name,
            kcal: editingFood.value.kcal,
            protein: editingFood.value.protein,
            carbs: editingFood.value.carbs,
            fat: editingFood.value.fat
          })
        }
        closeModal()
        await loadFoods()
      } catch (err) {
        error.value = err.message || 'Failed to save food'
      }
    }

    const deleteFood = async (food) => {
      if (!confirm('Are you sure you want to delete this food?')) return
      try {
        await api.deleteAdminFood(food.food_id || food.id)
        await loadFoods()
      } catch (err) {
        alert('Failed to delete food')
      }
    }

    onMounted(loadFoods)

    return {
      foods,
      showModal,
      editingFood,
      error,
      showAddModal,
      editFood,
      closeModal,
      handleSave,
      deleteFood
    }
  }
}
</script>
