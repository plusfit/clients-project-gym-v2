export interface Exercise {
  _id: string;
  name: string;
  description: string;
  type: 'cardio' | 'room';
  rest?: number;
  createdAt?: string;
  updatedAt?: string;
  reps?: number;
  series?: number;
  minutes?: number;
  imageUrl?: string;
  videoUrl?: string;
}

export interface SubRoutine {
  _id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  updatedAt: string;
  createdAt: string;
  category: string;
  __v?: number;
}

export interface Routine {
  _id: string;
  name: string;
  description: string;
  isCustom: boolean;
  isGeneral: boolean;
  type: string;
  subRoutines: SubRoutine[];
}

export interface RoutineResponse {
  success: boolean;
  data: Routine;
}

export interface SubRoutineWithExerciseDetails {
  _id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  category: string;
  updatedAt: string;
  createdAt: string;
}
