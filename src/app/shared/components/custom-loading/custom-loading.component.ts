import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { HighContrastDirective } from "../../directives/high-contrast.directive";

@Component({
	selector: "app-custom-loading",
	standalone: true,
	imports: [CommonModule, IonicModule, HighContrastDirective],
	template: `
    <div class="custom-loading-container" [ngClass]="{'fullscreen': fullscreen}">
      <div class="custom-loading-content" appHighContrast bgColor="var(--ion-color-loading-background)">
        <ion-spinner [name]="spinnerType" [color]="spinnerColor"></ion-spinner>
        <div class="message" *ngIf="message">{{ message }}</div>
      </div>
    </div>
  `,
	styles: [
		`
    .custom-loading-container {
      position: fixed;
      top: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .fullscreen {
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
    }

    .custom-loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      min-width: 200px;
    }

    ion-spinner {
      width: 36px;
      height: 36px;
      margin-bottom: 12px;
    }

    .message {
      color: var(--ion-color-loading-text);
      font-weight: 500;
      font-size: 16px;
      text-align: center;
    }
  `,
	],
})
export class CustomLoadingComponent {
	@Input() message = "Cargando...";
	@Input() spinnerType = "circles";
	@Input() spinnerColor = "primary";
	@Input() fullscreen = true;
}
