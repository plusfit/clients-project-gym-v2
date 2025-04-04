import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "dayTranslate",
	standalone: true,
})
export class DayTranslatePipe implements PipeTransform {
	private daysMap: { [key: number]: string } = {
		0: "Domingo",
		1: "Lunes",
		2: "Martes",
		3: "Miércoles",
		4: "Jueves",
		5: "Viernes",
		6: "Sábado",
	};

	transform(value: string | Date): string {
		try {
			const date = typeof value === "string" ? new Date(value) : value;

			if (isNaN(date.getTime())) return "Fecha inválida";

			return this.daysMap[date.getDay()];
		} catch (error) {
			return "Fecha inválida";
		}
	}
}
