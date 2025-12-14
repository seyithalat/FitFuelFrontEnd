// Exercises Module
import { api } from './api.js';

let exercisesCache = null;

export async function loadExercises() {
  if (exercisesCache) {
    return exercisesCache;
  }

  try {
    exercisesCache = await api.getExercises();
    return exercisesCache;
  } catch (error) {
    console.error('Error loading exercises:', error);
    return [];
  }
}

export async function loadExercisesList() {
  return await loadExercises();
}



