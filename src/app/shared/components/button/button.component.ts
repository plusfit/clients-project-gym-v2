import { Component, Input, ViewEncapsulation } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [IonButton, RouterLink, NgClass],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() disabled: boolean = false;
  @Input() fill: 'clear' | 'outline' | 'solid' | 'default' = 'outline';
  @Input() expand: 'full' | 'block' | '' = '';
  @Input() shape: 'round' | '' = '';
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Input() routerLink?: any;
  @Input() routerDirection: 'forward' | 'back' | 'root' = 'forward';
  @Input() type: string = 'button';

  get customClasses(): string {
    const baseClasses =
      'py-2 px-4 rounded transition-colors duration-300 focus:outline-none';
    const variants: { [key: string]: string } = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white',
      secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
    };
    return `${baseClasses} ${variants[this.variant]}`;
  }
}
