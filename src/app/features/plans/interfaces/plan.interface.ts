import { SubRoutine } from "@feature/routine/interfaces/routine.interface";

export interface Plan {
	_id: string;
	name: string;
	type: string;
	category: string;
	goal: string;
	experienceLevel: "beginner" | "intermediate" | "advanced";
	minAge?: number;
	maxAge?: number;
	includesCoach?: boolean;
	tags?: string[];
	defaultRoutine?: DefaultRoutine;
	days: number;
	createdAt?: string;
	updatedAt?: string;
	__v?: number; // Opcional, generalmente no necesario en frontend
}

export interface DefaultRoutine {
	_id: string;
	name: string;
	description?: string;
	isCustom?: boolean;
	isGeneral?: boolean;
	type?: string;
	subRoutines: string[] | SubRoutine[]; // Puede ser array de IDs o de objetos
	__v?: number;
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
