export interface Plan {
  id: string;
  name: string;
  type: 'room' | string;
  category: 'muscleGain' | string;
  goal: 'buildMuscle' | string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | string;
  minAge: number;
  maxAge: number;
  includesCoach: boolean;
  tags: string[];
  defaultRoutine: string;
  days: number;
  updatedAt: Date;
  createdAt: Date;
}
