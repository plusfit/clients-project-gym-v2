import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'goalTranslator',
  standalone: true
})
export class GoalTranslatorPipe implements PipeTransform {
  transform(goal: string): string {
    const translations: Record<string, string> = {
      'buildMuscle': 'Aumento de masa muscular',
      'loseWeight': 'Pérdida de peso',
      'improveStrength': 'Mejora de fuerza',
      'increaseEndurance': 'Aumento de resistencia',
      'toneBody': 'Tonificación corporal',
      'improveFlexibility': 'Mejora de flexibilidad',
      'generalFitness': 'Fitness general',
      'rehabilitation': 'Rehabilitación',
      'sportSpecific': 'Entrenamiento deportivo específico',
      'injuryRecovery': 'Recuperación de lesiones',
      'improveCardio': 'Mejora cardiovascular'
    };

    return translations[goal] || goal || 'Mejora general de la condición física';
  }
}
