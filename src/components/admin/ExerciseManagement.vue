<template>
  <div class="admin-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h2>Exercise Management</h2>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn-primary" @click="showAddModal">➕ Add Exercise</button>
        <button class="btn-secondary" @click="$emit('back')">← Back to Dashboard</button>
      </div>
    </div>
    <div class="workout-card">
      <div v-if="exercises.length === 0">No exercises found</div>
      <div v-for="exercise in exercises" :key="exercise.exercise_id || exercise.id" class="exercise-item">
        <div style="flex: 1;">
          <div class="exercise-name">{{ exercise.name || exercise.exercise_name || 'Unknown' }}</div>
          <div class="exercise-details">Exercise ID: {{ exercise.exercise_id || exercise.id }}</div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-secondary" @click="editExercise(exercise)">Edit</button>
          <button class="btn-danger" @click="deleteExercise(exercise)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Exercise Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingExercise.exercise_id ? 'Edit' : 'Add' }} Exercise</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <div class="form-group">
              <label>Exercise Name</label>
              <input type="text" v-model="editingExercise.name" required>
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
  name: 'ExerciseManagement',
  emits: ['back'],
  setup() {
    const exercises = ref([])
    const showModal = ref(false)
    const editingExercise = ref({ name: '' })
    const error = ref('')

    const loadExercises = async () => {
      try {
        exercises.value = await api.getExercises()
      } catch (err) {
        console.error('Error loading exercises:', err)
      }
    }

    const showAddModal = () => {
      editingExercise.value = { name: '' }
      showModal.value = true
    }

    const editExercise = (exercise) => {
      editingExercise.value = { ...exercise, name: exercise.name || exercise.exercise_name || '' }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      editingExercise.value = { name: '' }
      error.value = ''
    }

    const handleSave = async () => {
      error.value = ''
      try {
        if (editingExercise.value.exercise_id) {
          await api.updateAdminExercise(editingExercise.value.exercise_id, {
            name: editingExercise.value.name
          })
        } else {
          await api.createAdminExercise({
            name: editingExercise.value.name
          })
        }
        closeModal()
        await loadExercises()
      } catch (err) {
        error.value = err.message || 'Failed to save exercise'
      }
    }

    const deleteExercise = async (exercise) => {
      if (!confirm('Are you sure you want to delete this exercise?')) return
      try {
        await api.deleteAdminExercise(exercise.exercise_id || exercise.id)
        await loadExercises()
      } catch (err) {
        alert('Failed to delete exercise')
      }
    }

    onMounted(loadExercises)

    return {
      exercises,
      showModal,
      editingExercise,
      error,
      showAddModal,
      editExercise,
      closeModal,
      handleSave,
      deleteExercise
    }
  }
}
</script>
