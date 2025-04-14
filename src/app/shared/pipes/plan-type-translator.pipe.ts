import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'planTypeTranslator',
  standalone: true,
})
export class PlanTypeTranslatorPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return 'Desconocido';
    }

    switch (value.toLowerCase()) {
      case 'cardio':
        return 'Cardio';
      case 'room':
        return 'Sala';
      default:
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
}
