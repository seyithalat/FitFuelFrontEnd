// API utility functions for FitFuel
export const API_BASE_URL = 'http://localhost:3000';

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Get current user from token
export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    return null;
  }
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Cannot connect to backend API. Make sure the backend server is running on http://localhost:3000');
    }
    throw error;
  }
}

// API methods
const api = {
  // Users
  login(email, password) {
    return apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register(email, password) {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Workouts
  getWorkouts() {
    return apiRequest('/workouts');
  },

  createWorkout(workout) {
    return apiRequest('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout)
    });
  },

  updateWorkout(id, workout) {
    return apiRequest(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workout)
    });
  },

  deleteWorkout(id) {
    return apiRequest(`/workouts/${id}`, {
      method: 'DELETE'
    });
  },

  // Meals
  getMeals() {
    return apiRequest('/meals');
  },

  createMeal(meal) {
    return apiRequest('/meals', {
      method: 'POST',
      body: JSON.stringify(meal)
    });
  },

  updateMeal(id, meal) {
    return apiRequest(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meal)
    });
  },

  deleteMeal(id) {
    return apiRequest(`/meals/${id}`, {
      method: 'DELETE'
    });
  },

  // Foods
  getFoods() {
    return apiRequest('/foods');
  },

  // Exercises
  getExercises() {
    return apiRequest('/exercises');
  },

  // Preferences
  getPreferences(userId) {
    return apiRequest(`/preferences/${userId}`);
  },

  updatePreferences(userId, preferences) {
    return apiRequest(`/preferences/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  },

  // AI
  generateWorkoutPlan(data) {
    return apiRequest('/ai/workout-plan', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  generateRecipes(data) {
    return apiRequest('/ai/recipes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  generateFreestyle(data) {
    return apiRequest('/ai/freestyle', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Admin - Users
  getAdminUsers(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/admin/users${query}`);
  },

  updateAdminUser(userId, userData) {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteAdminUser(userId) {
    return apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // Admin - Stats
  getAdminStats() {
    return apiRequest('/admin/stats');
  },

  // Admin - Workouts
  getAdminWorkouts() {
    return apiRequest('/admin/workouts');
  },

  deleteAdminWorkout(workoutId) {
    return apiRequest(`/admin/workouts/${workoutId}`, {
      method: 'DELETE'
    });
  },

  // Admin - Meals
  getAdminMeals() {
    return apiRequest('/admin/meals');
  },

  deleteAdminMeal(mealId) {
    return apiRequest(`/admin/meals/${mealId}`, {
      method: 'DELETE'
    });
  },

  // Admin - Exercises
  createAdminExercise(exercise) {
    return apiRequest('/admin/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise)
    });
  },

  updateAdminExercise(exerciseId, exercise) {
    return apiRequest(`/admin/exercises/${exerciseId}`, {
      method: 'PUT',
      body: JSON.stringify(exercise)
    });
  },

  deleteAdminExercise(exerciseId) {
    return apiRequest(`/admin/exercises/${exerciseId}`, {
      method: 'DELETE'
    });
  },

  // Admin - Foods
  createAdminFood(food) {
    return apiRequest('/admin/foods', {
      method: 'POST',
      body: JSON.stringify(food)
    });
  },

  updateAdminFood(foodId, food) {
    return apiRequest(`/admin/foods/${foodId}`, {
      method: 'PUT',
      body: JSON.stringify(food)
    });
  },

  deleteAdminFood(foodId) {
    return apiRequest(`/admin/foods/${foodId}`, {
      method: 'DELETE'
    });
  },

  // User - Delete own account
  deleteOwnAccount() {
    return apiRequest('/users/me', {
      method: 'DELETE'
    });
  }
};

export function isAdmin() {
  const user = getCurrentUser();
  return user && user.is_admin === true;
}

// Export for ES6 modules
export { api };
