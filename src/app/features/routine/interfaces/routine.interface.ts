export interface Exercise {
	_id: string;
	name: string;
	description: string;
	type: "cardio" | "room";
	rest?: number;
	createdAt?: string;
	updatedAt?: string;
	reps?: number;
	series?: number;
	minutes?: number;
	imageUrl?: string;
	videoUrl?: string;
	category?: string;
	gifUrl?: string;
	mediaType?: "image" | "video" | "gif"; // Nuevo campo para identificar el tipo de media
	__v?: number;
}

export interface SubRoutine {
	_id: string;
	name: string;
	description: string;
	exercises: Exercise[] | string[];
	createdAt: string;
	updatedAt: string;
	category?: string;
	day?: string;
	dayNumber?: number;
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
