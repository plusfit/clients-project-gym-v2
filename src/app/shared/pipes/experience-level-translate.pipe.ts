import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "experienceLevel",
	standalone: true,
})
export class ExperienceLevelPipe implements PipeTransform {
	private levels: Record<string, string> = {
		beginner: "Principiante",
		intermediate: "Intermedio",
		advanced: "Avanzado",
	};

	transform(level: string): string {
		return this.levels[level] || level;
	}
}
