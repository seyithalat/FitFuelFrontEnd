FitFuel Frontend

Frontend for my fitness tracking app. Built with Vue. Connects to a backend API for workouts, meals, and some AI features.

Structure

Vue.js project structure:
- `src/` - source code
  - `main.js` - entry point
  - `App.vue` - root component
  - `components/` - Vue components
    - `Login.vue`, `Register.vue` - authentication
    - `Sidebar.vue` - navigation sidebar
    - `Dashboard.vue`, `Workouts.vue`, `Meals.vue`, `Calendar.vue`, `Preferences.vue`, `AI.vue`, `Minigame.vue` - page components
    - `Admin.vue` and `admin/` subcomponents - admin panel
    - `Modal.vue` - modal component
  - `services/` - service modules
    - `api.js` - API client
    - `aiService.js` - AI workout plan generation
  - `assets/` - static assets
    - `style.css` - global styles
- `public/` - public static files
  - `index.html` - HTML template
- `package.json` - dependencies and scripts
- `vue.config.js` - Vue CLI configuration

What it does

You can track workouts (exercises, sets, reps, weight), log meals with nutritional info, and set preferences like calorie targets and macros. There are also AI features that generate workout plans based on muscle groups and meal recipes. There's also a wordle game integrated from the backend.

Admin users get extra features to manage users, workouts, meals, and the exercise/food database.

How it works

Built with Vue 3 using the Composition API. Authentication tokens are stored in localStorage. The app checks if you're logged in on load and shows the right page.

All components are Vue Single File Components (.vue files). The app uses Vue's reactive system for state management.

The workout plan generator categorizes exercises by muscle groups (chest, back, legs, etc.) and creates proper splits like chest+triceps, back+biceps, legs+shoulders. It reads the primary_muscle field from exercises in the database.
Tech stuff

- Vue 3 with Composition API
- Vue CLI for build tooling
- Fetch API for backend calls
- LocalStorage for auth tokens
- Backend needs CORS enabled
