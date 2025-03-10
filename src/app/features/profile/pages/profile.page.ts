import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoadUser, UserState } from '../state/user.state';
import { User } from '@feature/profile/interfaces/user.interface';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AsyncPipe, NgIf, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    IonContent,
    AsyncPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    NgOptimizedImage,
    NgIf,
    IonCardContent,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
  ],
})
export class ProfilePage implements OnInit {
  @Select(UserState.getUser) user$!: Observable<User | null>;
  age: number | null = null;

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Despachamos la acción para cargar el usuario
    this.store.dispatch(new LoadUser());

    // Calculamos la edad una vez que tenemos la información del usuario
    this.user$.subscribe((user) => {
      if (user && user.userInfo && user.userInfo.dateBirthday) {
        this.age = this.calculateAge(new Date(user.userInfo.dateBirthday));
      }
    });
  }

  calculateAge(birthday: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  }
}
