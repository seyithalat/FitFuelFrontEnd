// Meals Module
import { api, getCurrentUser } from './api.js';
import { showModal, closeModal } from './app.js';

let foods = [];

export async function loadMealsPage() {
  await loadFoods();
  await renderMeals();
  
  document.getElementById('create-meal-btn')?.addEventListener('click', showCreateMealModal);
}

async function loadFoods() {
  try {
    foods = await api.getFoods();
  } catch (error) {
    console.error('Error loading foods:', error);
    foods = [];
  }
}

async function renderMeals() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const allMeals = await api.getMeals();
    const userMeals = allMeals.filter(m => m.user_id === user.user_id);
    
    // Sort by date descending
    userMeals.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('meals-list');
    if (!container) return;

    if (userMeals.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No meals logged yet. Log your first meal!</p>';
      return;
    }

    container.innerHTML = userMeals.map(meal => {
      const totals = calculateMealTotals(meal);
      // Get meal items (backend might use meal_items or mealitems)
      const mealItems = meal.meal_items || meal.mealitems || [];
      return `
        <div class="meal-card">
          <div class="workout-header">
            <div class="workout-date">${new Date(meal.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <button class="btn-danger" onclick="deleteMeal(${meal.meal_id})">Delete</button>
          </div>
          <div class="exercise-list">
            ${mealItems.length > 0 ? mealItems.map(item => {
              // Get food data (backend might use foods or food)
              const food = item.foods || item.food || {};
              const quantity = item.quantity || 0;
              const kcalPer100g = food.kcal || 0;
              const totalKcal = (kcalPer100g * quantity / 100).toFixed(0);
              return `
                <div class="exercise-item">
                  <div>
                    <div class="exercise-name">${food.name || 'Food'}</div>
                    <div class="exercise-details">${quantity}g (${kcalPer100g} kcal per 100g) | Total: ${totalKcal} kcal</div>
                  </div>
                </div>
              `;
            }).join('') : '<p>No items</p>'}
          </div>
          <div class="meal-totals">
            <span>Total: ${totals.kcal.toFixed(0)} kcal</span>
            <span>Protein: ${totals.protein.toFixed(1)}g</span>
            <span>Carbs: ${totals.carbs.toFixed(1)}g</span>
            <span>Fat: ${totals.fat.toFixed(1)}g</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading meals:', error);
    const container = document.getElementById('meals-list');
    if (container) {
      container.innerHTML = '<p style="color: var(--error);">Error loading meals. Please try again.</p>';
    }
  }
}

function calculateMealTotals(meal) {
  const mealItems = meal.meal_items || meal.mealitems || [];
  if (mealItems.length === 0) {
    return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  }

  return mealItems.reduce((total, item) => {
    const food = item.foods || item.food || {};
    const quantity = item.quantity || 0;
    // Nutritional values are per 100g
    const multiplier = quantity / 100;
    return {
      kcal: total.kcal + (food.kcal || 0) * multiplier,
      protein: total.protein + (food.protein || 0) * multiplier,
      carbs: total.carbs + (food.carbs || 0) * multiplier,
      fat: total.fat + (food.fat || 0) * multiplier
    };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

function showCreateMealModal() {
  const date = new Date().toISOString().split('T')[0];
  const foodsHtml = foods.map(food => 
    `<option value="${food.food_id}">${food.name} (${food.kcal} kcal per 100g)</option>`
  ).join('');

  const modalContent = `
    <form id="create-meal-form">
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="meal-date" value="${date}" required>
      </div>
      <div id="foods-container">
        <div class="exercise-form-item">
          <div class="form-row">
            <div class="form-group">
              <label>Food</label>
              <select id="food-0" required>
                <option value="">Select food</option>
                ${foodsHtml}
              </select>
            </div>
            <div class="form-group">
              <label>Quantity (grams)</label>
              <input type="number" id="quantity-0" min="0.1" step="0.1" value="100" required>
            </div>
            <div class="form-group" style="display: flex; align-items: flex-end;">
              <button type="button" class="btn-danger" onclick="this.closest('.exercise-form-item').remove()">Remove</button>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top: 1rem;">
        <button type="button" class="btn-secondary" onclick="addFoodField()">➕ Add Food</button>
      </div>
      <div id="meal-error" class="error-message"></div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button type="submit" class="btn-primary">Log Meal</button>
        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
      </div>
    </form>
  `;

  showModal('Log Meal', modalContent);

  window.foodCounter = 1;

  document.getElementById('create-meal-form')?.addEventListener('submit', handleCreateMeal);
}

window.addFoodField = function() {
  const container = document.getElementById('foods-container');
  if (!container) return;

  const foodsHtml = foods.map(food => 
    `<option value="${food.food_id}">${food.name} (${food.kcal} kcal per 100g)</option>`
  ).join('');

  const newFood = document.createElement('div');
  newFood.className = 'exercise-form-item';
  newFood.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Food</label>
        <select id="food-${window.foodCounter}" required>
          <option value="">Select food</option>
          ${foodsHtml}
        </select>
      </div>
      <div class="form-group">
        <label>Quantity (grams)</label>
        <input type="number" id="quantity-${window.foodCounter}" min="0.1" step="0.1" value="100" required>
      </div>
      <div class="form-group" style="display: flex; align-items: flex-end;">
        <button type="button" class="btn-danger" onclick="this.closest('.exercise-form-item').remove()">Remove</button>
      </div>
    </div>
  `;
  container.appendChild(newFood);
  window.foodCounter++;
};

async function handleCreateMeal(e) {
  e.preventDefault();
  const errorEl = document.getElementById('meal-error');
  if (errorEl) errorEl.textContent = '';

  const date = document.getElementById('meal-date')?.value;
  if (!date) return;

  const foodItems = document.querySelectorAll('#foods-container .exercise-form-item');
  const items = [];

  for (let item of foodItems) {
    const index = Array.from(foodItems).indexOf(item);
    const foodId = parseInt(document.getElementById(`food-${index}`)?.value);
    const quantity = parseFloat(document.getElementById(`quantity-${index}`)?.value);

    if (foodId && quantity) {
      items.push({ food_id: foodId, quantity });
    }
  }

  if (items.length === 0) {
    if (errorEl) errorEl.textContent = 'Please add at least one food item';
    return;
  }

  try {
    await api.createMeal({
      date: date,
      items: items
    });

    closeModal();
    await renderMeals();
  } catch (error) {
    console.error('Error creating meal:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to create meal';
    }
  }
}

window.deleteMeal = async function(mealId) {
  if (!confirm('Delete this meal?')) return;

  try {
    await api.deleteMeal(mealId);
    await renderMeals();
  } catch (error) {
    console.error('Error deleting meal:', error);
    alert('Failed to delete meal');
  }
};
