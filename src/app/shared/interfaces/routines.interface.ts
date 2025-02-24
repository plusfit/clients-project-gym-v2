export interface Routine {
  _id: string;
  name: string;
  description: string;
  category: string;
  isCustom: boolean;
  subRoutines: SubRoutine[];
}

export interface SubRoutine {
  _id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  updatedAt: string;
  createdAt: string;
  category: string;
}

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  mode: string;
  type: 'cardio' | 'sala';
  minutes?: number;
  rest?: number;
  reps?: number;
  series?: number;
  createdAt: string;
  updatedAt: string;
}
