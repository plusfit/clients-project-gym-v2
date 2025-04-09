export interface Plan {
	_id?: string;
	id?: string;
	name: string;
	description: string;
	level: "beginner" | "intermediate" | "advanced";
	daysPerWeek: number;
	goal: string;
	duration: number;
	exercises?: PlanExercise[];
	createdAt?: string;
	updatedAt?: string;
}

export interface PlanExercise {
	name: string;
	sets: number;
	reps: number;
	rest: number;
	description?: string;
	videoUrl?: string;
	imageUrl?: string;
	day: number;
}
