<template>
  <div class="page-content">
    <div class="page-header">
      <h2>Workout Calendar</h2>
    </div>
    <div class="calendar-container">
      <div class="calendar-header">
        <h3>{{ monthName }} {{ year }}</h3>
      </div>
      <div class="calendar-grid">
        <div v-for="day in dayNames" :key="day" class="calendar-day-header">{{ day }}</div>
        <div v-for="empty in emptyDays" :key="`empty-${empty}`" class="calendar-day"></div>
        <div 
          v-for="day in daysInMonth" 
          :key="day"
          :class="['calendar-day', { 'has-workout': hasWorkout(day), 'today': isToday(day) }]"
          @click="showWorkoutsForDate(day)"
        >
          <div>{{ day }}</div>
          <div v-if="hasWorkout(day)" style="font-size: 0.7rem; margin-top: 0.25rem;">
            {{ getWorkoutCount(day) }} exercise{{ getWorkoutCount(day) > 1 ? 's' : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api, getCurrentUser } from '../services/api'

export default {
  name: 'Calendar',
  setup() {
    const workoutsByDate = ref({})
    const now = ref(new Date())
    const year = computed(() => now.value.getFullYear())
    const month = computed(() => now.value.getMonth())

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December']
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const monthName = computed(() => monthNames[month.value])

    const firstDay = computed(() => new Date(year.value, month.value, 1))
    const lastDay = computed(() => new Date(year.value, month.value + 1, 0))
    const daysInMonth = computed(() => lastDay.value.getDate())
    const startingDayOfWeek = computed(() => firstDay.value.getDay())
    const emptyDays = computed(() => Array(startingDayOfWeek.value).fill(0))

    const loadWorkouts = async () => {
      const user = getCurrentUser()
      if (!user) return

      try {
        const allWorkouts = await api.getWorkouts()
        const userWorkouts = allWorkouts.filter(w => w.user_id === user.user_id)

        const byDate = {}
        userWorkouts.forEach(workout => {
          const dateKey = new Date(workout.date).toDateString()
          if (!byDate[dateKey]) {
            byDate[dateKey] = []
          }
          byDate[dateKey].push(workout)
        })
        workoutsByDate.value = byDate
      } catch (err) {
        console.error('Error loading workouts:', err)
      }
    }

    const getDateKey = (day) => {
      const date = new Date(year.value, month.value, day)
      return date.toDateString()
    }

    const hasWorkout = (day) => {
      const dateKey = getDateKey(day)
      return workoutsByDate.value[dateKey] && workoutsByDate.value[dateKey].length > 0
    }

    const getWorkoutCount = (day) => {
      const dateKey = getDateKey(day)
      return workoutsByDate.value[dateKey] ? workoutsByDate.value[dateKey].length : 0
    }

    const isToday = (day) => {
      const today = new Date()
      return day === today.getDate() && 
             month.value === today.getMonth() && 
             year.value === today.getFullYear()
    }

    const showWorkoutsForDate = async (day) => {
      const dateKey = getDateKey(day)
      const workouts = workoutsByDate.value[dateKey]

      if (!workouts || workouts.length === 0) {
        alert('No workouts on this date')
        return
      }

      const workoutList = []
      workouts.forEach(workout => {
        if (workout.workout_exercises && workout.workout_exercises.length > 0) {
          workout.workout_exercises.forEach(exercise => {
            const exerciseName = exercise.exercises?.name || 'Exercise'
            const sets = exercise.sets || 0
            const reps = exercise.reps || 0
            const weight = exercise.weight || 0
            workoutList.push(`• ${exerciseName}: ${sets} sets × ${reps} reps × ${weight}kg`)
          })
        }
      })

      if (workoutList.length === 0) {
        alert('No workouts on this date')
        return
      }

      alert(`Workouts on ${new Date(dateKey).toLocaleDateString()}:\n\n${workoutList.join('\n')}`)
    }

    onMounted(loadWorkouts)

    return {
      monthName,
      year,
      dayNames,
      daysInMonth,
      emptyDays,
      hasWorkout,
      getWorkoutCount,
      isToday,
      showWorkoutsForDate
    }
  }
}
</script>
