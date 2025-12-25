<template>
  <div class="page-content">
    <div class="page-header">
      <h2>Workouts</h2>
      <button class="btn-primary" @click="showCreateModal">➕ Create Workout</button>
    </div>
    <div v-if="loading" style="text-align: center; padding: 2rem;">Loading...</div>
    <div v-else-if="workoutsByDate.length === 0" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
      No workouts yet. Create your first workout!
    </div>
    <div v-else class="workouts-list">
      <div v-for="dateGroup in workoutsByDate" :key="dateGroup.date" class="workout-card">
        <div class="workout-header">
          <div class="workout-date">{{ formatDate(dateGroup.date) }}</div>
          <button class="btn-danger" @click="deleteWorkoutsByDate(dateGroup.date)">Delete</button>
        </div>
        <div class="exercise-list">
          <div v-for="exercise in dateGroup.exercises" :key="exercise.workout_id" class="exercise-item">
            <div>
              <div class="exercise-name">{{ exercise.exercise_name }}</div>
              <div class="exercise-details">{{ exercise.sets }} sets × {{ exercise.reps }} reps {{ exercise.weight }}kg</div>
            </div>
            <button class="btn-danger" @click="deleteWorkout(exercise.workout_id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Workout Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Create Workout</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleCreateWorkout">
            <div class="form-group">
              <label>Date</label>
              <input type="date" v-model="newWorkout.date" required>
            </div>
            <div v-for="(exercise, index) in newWorkout.exercises" :key="index" class="exercise-form-item">
              <div class="form-row">
                <div class="form-group">
                  <label>Exercise</label>
                  <select v-model="exercise.exercise" required>
                    <option value="">Select exercise</option>
                    <option v-for="ex in exercises" :key="ex.exercise_id || ex.id" :value="ex.name || ex.exercise_name">
                      {{ ex.name || ex.exercise_name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Sets</label>
                  <input type="number" v-model.number="exercise.sets" min="1" required>
                </div>
                <div class="form-group">
                  <label>Reps</label>
                  <input type="number" v-model.number="exercise.reps" min="1" required>
                </div>
                <div class="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" v-model.number="exercise.weight" min="0" step="0.5" required>
                </div>
                <div class="form-group" style="display: flex; align-items: flex-end;">
                  <button type="button" class="btn-danger" @click="removeExercise(index)">Remove</button>
                </div>
              </div>
            </div>
            <div style="margin-top: 1rem;">
              <button type="button" class="btn-secondary" @click="addExercise">➕ Add Exercise</button>
            </div>
            <div class="error-message">{{ error }}</div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
              <button type="submit" class="btn-primary">Create Workout</button>
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
  name: 'Workouts',
  setup() {
    const loading = ref(false)
    const workoutsByDate = ref([])
    const exercises = ref([])
    const showModal = ref(false)
    const error = ref('')
    const newWorkout = ref({
      date: new Date().toISOString().split('T')[0],
      exercises: [{ exercise: '', sets: 3, reps: 10, weight: 0 }]
    })

    const loadExercises = async () => {
      try {
        exercises.value = await api.getExercises()
      } catch (err) {
        console.error('Error loading exercises:', err)
        exercises.value = []
      }
    }

    const loadWorkouts = async () => {
      loading.value = true
      const user = getCurrentUser()
      if (!user) return

      try {
        const allWorkouts = await api.getWorkouts()
        const userWorkouts = allWorkouts.filter(w => w.user_id === user.user_id)
        
        const exercisesByDate = {}
        userWorkouts.forEach(workout => {
          const date = new Date(workout.date).toDateString()
          if (!exercisesByDate[date]) {
            exercisesByDate[date] = []
          }
          if (workout.workout_exercises && workout.workout_exercises.length > 0) {
            workout.workout_exercises.forEach(exercise => {
              exercisesByDate[date].push({
                workout_id: workout.workout_id,
                exercise_name: exercise.exercises?.name || 'Exercise',
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight
              })
            })
          }
        })

        workoutsByDate.value = Object.keys(exercisesByDate)
          .sort((a, b) => new Date(b) - new Date(a))
          .map(date => ({
            date,
            exercises: exercisesByDate[date]
          }))
      } catch (err) {
        console.error('Error loading workouts:', err)
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

    const showCreateModal = () => {
      if (exercises.value.length === 0) {
        loadExercises().then(() => {
          showModal.value = true
        })
      } else {
        showModal.value = true
      }
    }

    const closeModal = () => {
      showModal.value = false
      error.value = ''
      newWorkout.value = {
        date: new Date().toISOString().split('T')[0],
        exercises: [{ exercise: '', sets: 3, reps: 10, weight: 0 }]
      }
    }

    const addExercise = () => {
      newWorkout.value.exercises.push({ exercise: '', sets: 3, reps: 10, weight: 0 })
    }

    const removeExercise = (index) => {
      newWorkout.value.exercises.splice(index, 1)
    }

    const handleCreateWorkout = async () => {
      error.value = ''
      if (newWorkout.value.exercises.length === 0) {
        error.value = 'Please add at least one exercise'
        return
      }

      try {
        for (const ex of newWorkout.value.exercises) {
          await api.createWorkout({
            exercise: ex.exercise,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            date: newWorkout.value.date
          })
        }
        closeModal()
        await loadWorkouts()
      } catch (err) {
        error.value = err.message || 'Failed to create workout'
      }
    }

    const deleteWorkout = async (workoutId) => {
      if (!confirm('Delete this workout exercise?')) return
      try {
        await api.deleteWorkout(workoutId)
        await loadWorkouts()
      } catch (err) {
        alert('Failed to delete workout')
      }
    }

    const deleteWorkoutsByDate = async (date) => {
      if (!confirm('Delete all workouts for this date?')) return
      const user = getCurrentUser()
      if (!user) return

      try {
        const allWorkouts = await api.getWorkouts()
        const userWorkouts = allWorkouts.filter(w => w.user_id === user.user_id)
        const dateWorkouts = userWorkouts.filter(w => new Date(w.date).toDateString() === date)

        for (const workout of dateWorkouts) {
          await api.deleteWorkout(workout.workout_id)
        }
        await loadWorkouts()
      } catch (err) {
        alert('Failed to delete workouts')
      }
    }

    onMounted(async () => {
      await loadExercises()
      await loadWorkouts()
    })

    return {
      loading,
      workoutsByDate,
      exercises,
      showModal,
      error,
      newWorkout,
      formatDate,
      showCreateModal,
      closeModal,
      addExercise,
      removeExercise,
      handleCreateWorkout,
      deleteWorkout,
      deleteWorkoutsByDate
    }
  }
}
</script>
