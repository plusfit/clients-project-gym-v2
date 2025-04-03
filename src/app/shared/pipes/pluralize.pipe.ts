import { Pipe, PipeTransform } from '@angular/core';

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
    if (value === undefined || value === null) {
      return `- ${plural || singular + 's'}`;
    }

    if (value === 1) {
      return `${value} ${singular}`;
    }

    if (!plural) {
      if (singular === 'repetición') {
        plural = 'repeticiones';
      } else if (singular.endsWith('s') || singular.endsWith('x')) {
        plural = singular;
      } else {
        plural = `${singular}s`;
      }
    }

    return `${value} ${plural}`;
  }
}
