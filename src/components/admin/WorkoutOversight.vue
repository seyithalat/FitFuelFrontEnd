<template>
  <div class="admin-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h2>Workout Oversight</h2>
      <button class="btn-secondary" @click="$emit('back')">← Back to Dashboard</button>
    </div>
    <div class="workout-card">
      <div v-if="workouts.length === 0">No workouts found</div>
      <div v-for="workout in workouts" :key="workout.workout_id">
        <div v-for="exercise in (workout.workout_exercises || [])" :key="exercise.workout_exercise_id || exercise.id" class="exercise-item">
          <div style="flex: 1;">
            <div class="exercise-name">{{ exercise.exercises?.name || 'Exercise' }}</div>
            <div class="exercise-details">
              User ID: {{ workout.user_id }} | 
              Date: {{ formatDate(workout.date) }} | 
              {{ exercise.sets }} sets × {{ exercise.reps }} reps × {{ exercise.weight }}kg
            </div>
          </div>
          <button class="btn-danger" @click="deleteWorkout(workout.workout_id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from '../../services/api'

export default {
  name: 'WorkoutOversight',
  emits: ['back'],
  setup() {
    const workouts = ref([])

    const loadWorkouts = async () => {
      try {
        workouts.value = await api.getAdminWorkouts()
      } catch (err) {
        console.error('Error loading workouts:', err)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const deleteWorkout = async (workoutId) => {
      if (!confirm('Are you sure you want to delete this workout?')) return
      try {
        await api.deleteAdminWorkout(workoutId)
        await loadWorkouts()
      } catch (err) {
        alert('Failed to delete workout')
      }
    }

    onMounted(loadWorkouts)

    return {
      workouts,
      formatDate,
      deleteWorkout
    }
  }
}
</script>
