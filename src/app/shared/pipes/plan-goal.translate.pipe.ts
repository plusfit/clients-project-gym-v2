import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'goal',
  standalone: true,
})
export class GoalPipe implements PipeTransform {
  private goals: Record<string, string> = {
    buildMuscle: 'Ganar masa muscular',
    loseFat: 'Perder grasa',
    maintain: 'Mantener',
    improveResistance: 'Mejorar resistencia',
    improveStrength: 'Mejorar fuerza',
  };

  transform(goal: string): string {
    return this.goals[goal] || goal;
  }
}
