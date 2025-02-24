export interface Exercise {
  _id: string;
  name: string;
  description: string;
  type: string;
  mode: string;
  minutes: number;
  rest: number;
  reps: number;
  series: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubRoutine {
  _id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Routine {
  _id: string;
  name: string;
  description: string;
  category: string;
  isCustom: boolean;
  subRoutines: SubRoutine[];
}
