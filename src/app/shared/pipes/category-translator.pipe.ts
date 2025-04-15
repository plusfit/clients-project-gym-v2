import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryTranslator',
  standalone: true,
})
export class CategoryTranslatorPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return 'Desconocida';
    }

    switch (value.toLowerCase()) {
      case 'musclegain':
        return 'Ganancia Muscular';
      case 'weightloss':
        return 'Pérdida de Peso';
      case 'toning':
        return 'Tonificación';
      case 'generalfitness':
        return 'Acondicionamiento General';
      case 'strength':
        return 'Fuerza';
      case 'endurance':
        return 'Resistencia';
      default:
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
}
