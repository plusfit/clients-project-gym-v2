import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {
  showSplash = true;

  ngOnInit(): void {
    // Ocultar el splash después de 2.3 segundos (tiempo de animación completa)
    setTimeout(() => {
      this.showSplash = false;
    }, 2300);
  }
}
