import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "pluralize",
	standalone: true,
})
export class PluralizePipe implements PipeTransform {
	/**
	 * Transforma un valor numérico aplicando la pluralización correcta
	 * @param value El valor numérico
	 * @param singular La forma singular de la unidad
	 * @param plural La forma plural de la unidad (opcional, se genera automáticamente si no se proporciona)
	 * @returns La representación textual con la forma plural o singular correcta
	 */
	transform(
		value: number | undefined | null,
		singular: string,
		pluralParam?: string,
	): string {
		if (!pluralParam) {
			let finalPlural: string;
			if (singular === "repetición") {
				finalPlural = "repeticiones";
			} else if (singular.endsWith("s") || singular.endsWith("x")) {
				finalPlural = singular;
			} else {
				finalPlural = `${singular}s`;
			}
			return `${value} ${finalPlural}`;
		}

		return `${value} ${pluralParam}`;
	}
}
