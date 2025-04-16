import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

/**
 * Componente para mostrar el logo de la aplicación en distintos tamaños y estilos
 * Uso:
 * <app-logo></app-logo> - Tamaño por defecto (40px)
 * <app-logo [size]="60"></app-logo> - Tamaño personalizado
 * <app-logo [withText]="true"></app-logo> - Logo con texto PLUS FIT
 */
@Component({
	selector: "app-logo",
	standalone: true,
	imports: [CommonModule],
	template: `
    <div
      class="logo-container"
      [style.width.px]="size"
      [style.height.px]="size"
    >
      <div
        class="logo"
        [class.with-text]="withText"
        [style.width.px]="size"
        [style.height.px]="size"
      ></div>
      <div class="text" *ngIf="withText">
        <span class="plus">PLUS</span> <span class="fit">FIT</span>
      </div>
    </div>
  `,
	styles: [
		`
      .logo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .logo {
        background-image: url('/assets/logos/logo.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        margin-bottom: 8px;

        &.with-text {
          margin-bottom: 8px;
        }
      }

      .text {
        font-family: 'APEXPRO', sans-serif;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 1px;
        font-size: 1.2rem;
        white-space: nowrap;
        color: white;
      }

      .plus {
        font-weight: 800;
      }

      .fit {
        opacity: 0.9;
      }
    `,
	],
})
export class AppLogoComponent {
	/**
	 * Tamaño del logo en píxeles
	 */
	@Input() size = 40;

	/**
	 * Si se debe mostrar el texto "PLUS FIT" bajo el logo
	 */
	@Input() withText = false;
}
