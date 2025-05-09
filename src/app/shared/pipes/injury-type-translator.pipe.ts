import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'injuryTypeTranslator',
  standalone: true
})
export class InjuryTypeTranslatorPipe implements PipeTransform {
  transform(injuryType: string | null): string {
    if (!injuryType) return 'No especificado';

    const translations: Record<string, string> = {
      'shoulder': 'Hombro',
      'knee': 'Rodilla',
      'back': 'Espalda',
      'ankle': 'Tobillo',
      'hip': 'Cadera',
      'elbow': 'Codo',
      'wrist': 'Muñeca',
      'neck': 'Cuello',
      'other': 'Otra'
    };

    return translations[injuryType] || injuryType;
  }
}
