import { NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-profile-plan-info',
  standalone: true,
  imports: [IonCardContent, IonIcon, IonCard, IonCardHeader, IonCardTitle],
  templateUrl: './profile-plan-info.component.html',
  styleUrl: '../../pages/profile.page.scss',
})
export class ProfilePlanInfoComponent {}
