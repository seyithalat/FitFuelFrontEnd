# FitFuel Frontend

A Vue.js frontend application for the FitFuel fitness and nutrition tracking API.

## Project Structure

```
fitfuel-frontend/
├── css/
│   └── style.css          # Stylesheet
├── js/
│   ├── api.js            # API utility functions
│   ├── users.js          # Authentication composable
│   ├── workouts.js       # Workouts composable
│   ├── meals.js          # Meals composable
│   ├── preferences.js    # Preferences composable
│   ├── ai.js             # AI features composable
│   └── main.js           # (Not used - all in index.html)
├── index.html            # Main HTML file with Vue app
└── README.md            # This file
```

## Features

- **Authentication**: Login and Register
- **Workouts**: Track exercises, sets, reps, and weight
- **Meals**: Log meals with food items and nutritional info
- **Preferences**: Set calorie targets, macros, liked exercises, and disliked foods
- **AI Features**: 
  - Generate workout plans
  - Generate meal recipes
  - Generate freestyle circuit workouts

## Setup

1. Make sure your FitFuel API backend is running on `http://localhost:3000`

2. Open `index.html` in a modern web browser, or use a local server:

   **Using Python:**
   ```bash
   cd fitfuel-frontend
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser

   **Using Node.js (http-server):**
   ```bash
   npx http-server fitfuel-frontend -p 8000
   ```

   **Using VS Code Live Server:**
   - Install the "Live Server" extension
   - Right-click `index.html` and select "Open with Live Server"

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: View your workout and meal statistics
3. **Workouts**: Add and manage your workout sessions
4. **Meals**: Log meals by selecting foods and quantities
5. **Preferences**: Set your fitness goals and preferences
6. **AI Features**: Generate personalized workout plans and meal recipes

## API Endpoints Used

- `POST /users/login` - Login
- `POST /users` - Register
- `GET /workouts` - Get all workouts
- `POST /workouts` - Create workout
- `DELETE /workouts/:id` - Delete workout
- `GET /meals` - Get all meals
- `POST /meals` - Create meal
- `DELETE /meals/:id` - Delete meal
- `GET /foods` - Get all foods
- `GET /preferences/:userId` - Get preferences
- `PUT /preferences/:userId` - Update preferences
- `POST /ai/workout-plan` - Generate workout plan
- `POST /ai/recipes` - Generate meal recipe
- `POST /ai/freestyle` - Generate freestyle workout

## Technologies

- Vue.js 3 (via CDN)
- Vanilla JavaScript (ES6 modules)
- Fetch API for HTTP requests
- LocalStorage for token storage

## Notes

- Authentication tokens are stored in localStorage
- The app uses Vue 3 Composition API
- All API calls include authentication headers when logged in
- CORS must be enabled on the backend for this to work

