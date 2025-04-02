import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para manejar la pluralización de unidades en español
 *
 * Uso:
 * {{ 1 | pluralize:'minuto' }} => '1 minuto'
 * {{ 2 | pluralize:'minuto' }} => '2 minutos'
 * {{ 1 | pluralize:'serie' }} => '1 serie'
 * {{ 5 | pluralize:'serie' }} => '5 series'
 * {{ 1 | pluralize:'repetición':'repeticiones' }} => '1 repetición'
 * {{ 10 | pluralize:'repetición':'repeticiones' }} => '10 repeticiones'
 */
@Pipe({
  name: 'pluralize',
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
    plural?: string,
  ): string {
    // Si no hay valor, retornar un mensaje por defecto
    if (value === undefined || value === null) {
      return `- ${plural || singular + 's'}`;
    }

    if (value === 1) {
      return `${value} ${singular}`;
    }

    // Si no se proporciona una forma plural específica, añadir 's' al singular
    // Excepto para casos especiales
    if (!plural) {
      if (singular === 'repetición') {
        plural = 'repeticiones';
      } else if (singular.endsWith('s') || singular.endsWith('x')) {
        // Palabras que terminan en 's' o 'x' permanecen igual en plural
        plural = singular;
      } else {
        plural = `${singular}s`;
      }
    }

    return `${value} ${plural}`;
  }
}
