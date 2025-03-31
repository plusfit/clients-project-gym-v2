import { Component, Input } from '@angular/core';
import { IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
// import {NgClass} from "@angular/common";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonLabel,
    IonInput,
    FormsModule,
    // NgClass
  ],
})
export class InputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';

  value: string = '';
  inputClasses: string =
    'rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
}
