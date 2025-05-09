import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "goal",
	standalone: true,
})
export class GoalPipe implements PipeTransform {
	private goals: Record<string, string> = {
		buildMuscle: "Ganar masa muscular",
		loseFat: "Perder grasa",
		loseWeight: "Perder peso",
		maintain: "Mantener",
		improveResistance: "Mejorar resistencia",
		improveStrength: "Mejorar fuerza",
		improveCardio: "Mejorar cardio",
		increaseFlexibility: "Mejorar flexibilidad",
		generalFitness: "Mejorar estado físico general",
		injuryRecovery: "Recuperación de lesiones"
	};

	transform(goal: string): string {
		return this.goals[goal] || goal;
	}
}
