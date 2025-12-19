// Admin Module
import { api, getCurrentUser, isAdmin } from './api.js';

export async function loadAdminPage() {
  if (!isAdmin()) {
    window.location.href = '#';
    return;
  }

  await renderAdminDashboard();
}

async function renderAdminDashboard() {
  const container = document.getElementById('admin-content');
  if (!container) return;

  try {
    // Load stats
    const stats = await api.getAdminStats();
    
    // Get count from stats, checking totals object first, then direct access
    function getCount(stats, ...possibleKeys) {
      if (stats?.totals) {
        for (const key of possibleKeys) {
          const value = stats.totals[key];
          if (value !== undefined && value !== null) {
            if (typeof value === 'number') return value;
            if (Array.isArray(value)) return value.length;
          }
        }
      }
      
      for (const key of possibleKeys) {
        const value = stats?.[key];
        if (value !== undefined && value !== null) {
          if (typeof value === 'number') return value;
          if (Array.isArray(value)) return value.length;
        }
      }
      return 0;
    }
    
    // Get counts for each stat type
    const totalUsers = getCount(stats, 'users', 'total_users', 'totalUsers', 'users_count', 'usersCount');
    const totalWorkouts = getCount(stats, 'workouts', 'total_workouts', 'totalWorkouts', 'workouts_count', 'workoutsCount');
    const totalMeals = getCount(stats, 'meals', 'total_meals', 'totalMeals', 'meals_count', 'mealsCount');
    const totalExercises = getCount(stats, 'exercises', 'total_exercises', 'totalExercises', 'exercises_count', 'exercisesCount');
    const totalFoods = getCount(stats, 'foods', 'total_foods', 'totalFoods', 'foods_count', 'foodsCount');
    
    container.innerHTML = `
      <div class="admin-dashboard">
        <!-- Stats Overview -->
        <div class="dashboard-grid" style="margin-bottom: 2rem;">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>Total Users</h3>
              <p>${totalUsers}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💪</div>
            <div class="stat-info">
              <h3>Total Workouts</h3>
              <p>${totalWorkouts}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🍽️</div>
            <div class="stat-info">
              <h3>Total Meals</h3>
              <p>${totalMeals}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
              <h3>Exercises</h3>
              <p>${totalExercises}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🥗</div>
            <div class="stat-info">
              <h3>Foods</h3>
              <p>${totalFoods}</p>
            </div>
          </div>
        </div>

        <!-- Admin Sections -->
        <div class="admin-sections">
          <div class="admin-section-card" onclick="loadUserManagement()">
            <h3>👥 User Management</h3>
            <p>View, edit, and manage all users</p>
          </div>
          <div class="admin-section-card" onclick="loadWorkoutOversight()">
            <h3>💪 Workout Oversight</h3>
            <p>View and manage all workouts</p>
          </div>
          <div class="admin-section-card" onclick="loadMealOversight()">
            <h3>🍽️ Meal Oversight</h3>
            <p>View and manage all meals</p>
          </div>
          <div class="admin-section-card" onclick="loadExerciseManagement()">
            <h3>📝 Exercise Management</h3>
            <p>Add, edit, and remove exercises</p>
          </div>
          <div class="admin-section-card" onclick="loadFoodManagement()">
            <h3>🥗 Food Management</h3>
            <p>Add, edit, and remove foods</p>
          </div>
        </div>

        <!-- Most Active Users -->
        ${stats.most_active_users && stats.most_active_users.length > 0 ? `
          <div style="margin-top: 2rem;">
            <h3>Most Active Users</h3>
            <div class="workout-card">
              ${stats.most_active_users.map((user, index) => `
                <div class="exercise-item">
                  <div>
                    <div class="exercise-name">${index + 1}. ${user.email}</div>
                    <div class="exercise-details">${user.workout_count || 0} workouts, ${user.meal_count || 0} meals</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Most Used Exercises -->
        ${stats.most_used_exercises && stats.most_used_exercises.length > 0 ? `
          <div style="margin-top: 2rem;">
            <h3>Most Used Exercises</h3>
            <div class="workout-card">
              ${stats.most_used_exercises.map((ex, index) => `
                <div class="exercise-item">
                  <div>
                    <div class="exercise-name">${index + 1}. ${ex.name || ex.exercise_name || 'Unknown'}</div>
                    <div class="exercise-details">Used ${ex.count || 0} times</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Most Used Foods -->
        ${stats.most_used_foods && stats.most_used_foods.length > 0 ? `
          <div style="margin-top: 2rem;">
            <h3>Most Used Foods</h3>
            <div class="workout-card">
              ${stats.most_used_foods.map((food, index) => `
                <div class="exercise-item">
                  <div>
                    <div class="exercise-name">${index + 1}. ${food.name || 'Unknown'}</div>
                    <div class="exercise-details">Used ${food.count || 0} times</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    container.innerHTML = '<p style="color: var(--error);">Error loading admin dashboard. Please try again.</p>';
  }
}

window.loadUserManagement = async function() {
  const container = document.getElementById('admin-content');
  if (!container) return;

  try {
    const users = await api.getAdminUsers();
    
    container.innerHTML = `
      <div class="admin-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>User Management</h2>
          <button class="btn-secondary" onclick="loadAdminPage()">← Back to Dashboard</button>
        </div>
        <div style="margin-bottom: 1rem;">
          <input type="text" id="user-search" placeholder="Search by email..." style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">
        </div>
        <div class="workout-card">
          ${users.length > 0 ? users.map(user => `
            <div class="exercise-item">
              <div style="flex: 1;">
                <div class="exercise-name">${user.email}</div>
                <div class="exercise-details">
                  User ID: ${user.user_id} | 
                  Workouts: ${user.workout_count || 0} | 
                  Meals: ${user.meal_count || 0} |
                  ${user.is_admin ? '<span style="color: var(--primary);">Admin</span>' : 'User'}
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-secondary" onclick="editUser(${user.user_id})">Edit</button>
                <button class="btn-danger" onclick="deleteUser(${user.user_id}, '${user.email}')">Delete</button>
              </div>
            </div>
          `).join('') : '<p>No users found</p>'}
        </div>
      </div>
    `;

    // Add search functionality
    document.getElementById('user-search')?.addEventListener('input', async (e) => {
      const search = e.target.value;
      const filteredUsers = await api.getAdminUsers(search);
      // Re-render with filtered results
      const userList = document.querySelector('.workout-card');
      if (userList) {
        userList.innerHTML = filteredUsers.length > 0 ? filteredUsers.map(user => `
          <div class="exercise-item">
            <div style="flex: 1;">
              <div class="exercise-name">${user.email}</div>
              <div class="exercise-details">
                User ID: ${user.user_id} | 
                Workouts: ${user.workout_count || 0} | 
                Meals: ${user.meal_count || 0} |
                ${user.is_admin ? '<span style="color: var(--primary);">Admin</span>' : 'User'}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-secondary" onclick="editUser(${user.user_id})">Edit</button>
              <button class="btn-danger" onclick="deleteUser(${user.user_id}, '${user.email}')">Delete</button>
            </div>
          </div>
        `).join('') : '<p>No users found</p>';
      }
    });
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Error loading users');
  }
};

window.editUser = async function(userId) {
  try {
    const users = await api.getAdminUsers();
    const user = users.find(u => u.user_id === userId);
    if (!user) return;

    const modalContent = `
      <form id="edit-user-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="edit-email" value="${user.email}" required>
        </div>
        <div class="form-group">
          <label>New Password (leave blank to keep current)</label>
          <input type="password" id="edit-password" placeholder="Enter new password">
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="edit-is-admin" ${user.is_admin ? 'checked' : ''}>
            Admin User
          </label>
        </div>
        <div id="edit-user-error" class="error-message"></div>
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
          <button type="submit" class="btn-primary">Save Changes</button>
          <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
        </div>
      </form>
    `;

    window.showModal('Edit User', modalContent);
    document.getElementById('edit-user-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('edit-user-error');
      if (errorEl) errorEl.textContent = '';

      try {
        const updateData = {
          email: document.getElementById('edit-email')?.value,
          is_admin: document.getElementById('edit-is-admin')?.checked
        };
        const password = document.getElementById('edit-password')?.value;
        if (password) {
          updateData.password = password;
        }

        await api.updateAdminUser(userId, updateData);
        window.window.closeModal();
        await loadUserManagement();
      } catch (error) {
        if (errorEl) {
          errorEl.textContent = error.message || 'Failed to update user';
        }
      }
    });
  } catch (error) {
    console.error('Error editing user:', error);
    alert('Error loading user data');
  }
};

window.deleteUser = async function(userId, email) {
  if (!confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) return;

  try {
    await api.deleteAdminUser(userId);
    await loadUserManagement();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Failed to delete user');
  }
};

window.loadWorkoutOversight = async function() {
  const container = document.getElementById('admin-content');
  if (!container) return;

  try {
    const workouts = await api.getAdminWorkouts();
    
    container.innerHTML = `
      <div class="admin-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>Workout Oversight</h2>
          <button class="btn-secondary" onclick="loadAdminPage()">← Back to Dashboard</button>
        </div>
        <div class="workout-card">
          ${workouts.length > 0 ? workouts.map(workout => {
            const exercises = workout.workout_exercises || [];
            return exercises.map(exercise => `
              <div class="exercise-item">
                <div style="flex: 1;">
                  <div class="exercise-name">${exercise.exercises?.name || 'Exercise'}</div>
                  <div class="exercise-details">
                    User ID: ${workout.user_id} | 
                    Date: ${new Date(workout.date).toLocaleDateString()} | 
                    ${exercise.sets} sets × ${exercise.reps} reps × ${exercise.weight}kg
                  </div>
                </div>
                <button class="btn-danger" onclick="deleteAdminWorkout(${workout.workout_id})">Delete</button>
              </div>
            `).join('');
          }).join('') : '<p>No workouts found</p>'}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading workouts:', error);
    alert('Error loading workouts');
  }
};

window.deleteAdminWorkout = async function(workoutId) {
  if (!confirm('Are you sure you want to delete this workout?')) return;

  try {
    await api.deleteAdminWorkout(workoutId);
    await loadWorkoutOversight();
  } catch (error) {
    console.error('Error deleting workout:', error);
    alert('Failed to delete workout');
  }
};

window.loadMealOversight = async function() {
  const container = document.getElementById('admin-content');
  if (!container) return;

  try {
    const meals = await api.getAdminMeals();
    
    container.innerHTML = `
      <div class="admin-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>Meal Oversight</h2>
          <button class="btn-secondary" onclick="loadAdminPage()">← Back to Dashboard</button>
        </div>
        <div class="workout-card">
          ${meals.length > 0 ? meals.map(meal => {
            const items = meal.meal_items || meal.mealitems || [];
            return items.map(item => {
              const food = item.foods || item.food || {};
              return `
                <div class="exercise-item">
                  <div style="flex: 1;">
                    <div class="exercise-name">${food.name || 'Food'}</div>
                    <div class="exercise-details">
                      User ID: ${meal.user_id} | 
                      Date: ${new Date(meal.date).toLocaleDateString()} | 
                      Quantity: ${item.quantity}g
                    </div>
                  </div>
                  <button class="btn-danger" onclick="deleteAdminMeal(${meal.meal_id})">Delete</button>
                </div>
              `;
            }).join('');
          }).join('') : '<p>No meals found</p>'}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading meals:', error);
    alert('Error loading meals');
  }
};

window.deleteAdminMeal = async function(mealId) {
  if (!confirm('Are you sure you want to delete this meal?')) return;

  try {
    await api.deleteAdminMeal(mealId);
    await loadMealOversight();
  } catch (error) {
    console.error('Error deleting meal:', error);
    alert('Failed to delete meal');
  }
};

window.loadExerciseManagement = async function() {
  const container = document.getElementById('admin-content');
  if (!container) return;

  try {
    const exercises = await api.getExercises();
    
    container.innerHTML = `
      <div class="admin-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>Exercise Management</h2>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-primary" onclick="showAddExerciseModal()">➕ Add Exercise</button>
            <button class="btn-secondary" onclick="loadAdminPage()">← Back to Dashboard</button>
          </div>
        </div>
        <div class="workout-card">
          ${exercises.length > 0 ? exercises.map(exercise => `
            <div class="exercise-item">
              <div style="flex: 1;">
                <div class="exercise-name">${exercise.name || exercise.exercise_name || 'Unknown'}</div>
                <div class="exercise-details">Exercise ID: ${exercise.exercise_id || exercise.id}</div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-secondary" onclick="editExercise(${exercise.exercise_id || exercise.id}, '${(exercise.name || exercise.exercise_name || '').replace(/'/g, "\\'")}')">Edit</button>
                <button class="btn-danger" onclick="deleteExercise(${exercise.exercise_id || exercise.id})">Delete</button>
              </div>
            </div>
          `).join('') : '<p>No exercises found</p>'}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading exercises:', error);
    alert('Error loading exercises');
  }
};

window.showAddExerciseModal = function() {
  const modalContent = `
    <form id="add-exercise-form">
      <div class="form-group">
        <label>Exercise Name</label>
        <input type="text" id="exercise-name" required>
      </div>
      <div id="add-exercise-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Add Exercise</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  window.showModal('Add Exercise', modalContent);
  document.getElementById('add-exercise-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('add-exercise-error');
    if (errorEl) errorEl.textContent = '';

    try {
      await api.createAdminExercise({
        name: document.getElementById('exercise-name')?.value
      });
      window.closeModal();
      await loadExerciseManagement();
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = error.message || 'Failed to add exercise';
      }
    }
  });
};

window.editExercise = function(exerciseId, currentName) {
  const modalContent = `
    <form id="edit-exercise-form">
      <div class="form-group">
        <label>Exercise Name</label>
        <input type="text" id="edit-exercise-name" value="${currentName}" required>
      </div>
      <div id="edit-exercise-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Save Changes</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  window.showModal('Edit Exercise', modalContent);
  document.getElementById('edit-exercise-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('edit-exercise-error');
    if (errorEl) errorEl.textContent = '';

    try {
      await api.updateAdminExercise(exerciseId, {
        name: document.getElementById('edit-exercise-name')?.value
      });
      window.closeModal();
      await loadExerciseManagement();
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = error.message || 'Failed to update exercise';
      }
    }
  });
};

window.deleteExercise = async function(exerciseId) {
  if (!confirm('Are you sure you want to delete this exercise?')) return;

  try {
    await api.deleteAdminExercise(exerciseId);
    await loadExerciseManagement();
  } catch (error) {
    console.error('Error deleting exercise:', error);
    alert('Failed to delete exercise');
  }
};

window.loadFoodManagement = async function() {
  const container = document.getElementById('admin-content');
  if (!container) return;

  try {
    const foods = await api.getFoods();
    
    container.innerHTML = `
      <div class="admin-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>Food Management</h2>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-primary" onclick="showAddFoodModal()">➕ Add Food</button>
            <button class="btn-secondary" onclick="loadAdminPage()">← Back to Dashboard</button>
          </div>
        </div>
        <div class="workout-card">
          ${foods.length > 0 ? foods.map(food => `
            <div class="exercise-item">
              <div style="flex: 1;">
                <div class="exercise-name">${food.name || 'Unknown'}</div>
                <div class="exercise-details">
                  ${food.kcal || 0} kcal per 100g | 
                  Protein: ${food.protein || 0}g | 
                  Carbs: ${food.carbs || 0}g | 
                  Fat: ${food.fat || 0}g
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-secondary" onclick="editFood(${food.food_id || food.id}, '${(food.name || '').replace(/'/g, "\\'")}', ${food.kcal || 0}, ${food.protein || 0}, ${food.carbs || 0}, ${food.fat || 0})">Edit</button>
                <button class="btn-danger" onclick="deleteFood(${food.food_id || food.id})">Delete</button>
              </div>
            </div>
          `).join('') : '<p>No foods found</p>'}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading foods:', error);
    alert('Error loading foods');
  }
};

window.showAddFoodModal = function() {
  const modalContent = `
    <form id="add-food-form">
      <div class="form-group">
        <label>Food Name</label>
        <input type="text" id="food-name" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Calories (per 100g)</label>
          <input type="number" id="food-kcal" min="0" step="0.1" required>
        </div>
        <div class="form-group">
          <label>Protein (g per 100g)</label>
          <input type="number" id="food-protein" min="0" step="0.1" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Carbs (g per 100g)</label>
          <input type="number" id="food-carbs" min="0" step="0.1" required>
        </div>
        <div class="form-group">
          <label>Fat (g per 100g)</label>
          <input type="number" id="food-fat" min="0" step="0.1" required>
        </div>
      </div>
      <div id="add-food-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Add Food</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  window.showModal('Add Food', modalContent);
  document.getElementById('add-food-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('add-food-error');
    if (errorEl) errorEl.textContent = '';

    try {
      await api.createAdminFood({
        name: document.getElementById('food-name')?.value,
        kcal: parseFloat(document.getElementById('food-kcal')?.value),
        protein: parseFloat(document.getElementById('food-protein')?.value),
        carbs: parseFloat(document.getElementById('food-carbs')?.value),
        fat: parseFloat(document.getElementById('food-fat')?.value)
      });
      window.closeModal();
      await loadFoodManagement();
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = error.message || 'Failed to add food';
      }
    }
  });
};

window.editFood = function(foodId, currentName, currentKcal, currentProtein, currentCarbs, currentFat) {
  const modalContent = `
    <form id="edit-food-form">
      <div class="form-group">
        <label>Food Name</label>
        <input type="text" id="edit-food-name" value="${currentName}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Calories (per 100g)</label>
          <input type="number" id="edit-food-kcal" min="0" step="0.1" value="${currentKcal}" required>
        </div>
        <div class="form-group">
          <label>Protein (g per 100g)</label>
          <input type="number" id="edit-food-protein" min="0" step="0.1" value="${currentProtein}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Carbs (g per 100g)</label>
          <input type="number" id="edit-food-carbs" min="0" step="0.1" value="${currentCarbs}" required>
        </div>
        <div class="form-group">
          <label>Fat (g per 100g)</label>
          <input type="number" id="edit-food-fat" min="0" step="0.1" value="${currentFat}" required>
        </div>
      </div>
      <div id="edit-food-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Save Changes</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  window.showModal('Edit Food', modalContent);
  document.getElementById('edit-food-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('edit-food-error');
    if (errorEl) errorEl.textContent = '';

    try {
      await api.updateAdminFood(foodId, {
        name: document.getElementById('edit-food-name')?.value,
        kcal: parseFloat(document.getElementById('edit-food-kcal')?.value),
        protein: parseFloat(document.getElementById('edit-food-protein')?.value),
        carbs: parseFloat(document.getElementById('edit-food-carbs')?.value),
        fat: parseFloat(document.getElementById('edit-food-fat')?.value)
      });
      window.closeModal();
      await loadFoodManagement();
    } catch (error) {
      if (errorEl) {
        errorEl.textContent = error.message || 'Failed to update food';
      }
    }
  });
};

window.deleteFood = async function(foodId) {
  if (!confirm('Are you sure you want to delete this food?')) return;

  try {
    await api.deleteAdminFood(foodId);
    await loadFoodManagement();
  } catch (error) {
    console.error('Error deleting food:', error);
    alert('Failed to delete food');
  }
};

// Make loadAdminPage available globally
window.loadAdminPage = loadAdminPage;

