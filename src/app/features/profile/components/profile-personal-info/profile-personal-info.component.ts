import { NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-profile-personal-info',
  standalone: true,
  imports: [
    NgOptimizedImage,
    IonCardContent,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
  ],
  templateUrl: './profile-personal-info.component.html',
  styleUrl: '../../pages/profile.page.scss',
})
export class ProfilePersonalInfoComponent {
  @Input() email!: string;
  @Input() phone!: string;
  @Input() medicalSociety!: string;
}
