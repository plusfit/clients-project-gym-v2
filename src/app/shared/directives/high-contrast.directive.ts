import { Directive, ElementRef, Input, OnInit, Renderer2 } from "@angular/core";

@Directive({
	selector: "[appHighContrast]",
	standalone: true,
})
export class HighContrastDirective implements OnInit {
	@Input() textColor = "";
	@Input() bgColor = "";

	constructor(
		private el: ElementRef,
		private renderer: Renderer2,
	) {}

	ngOnInit() {
		// Aplicar colores de alto contraste
		if (this.textColor) {
			this.renderer.setStyle(this.el.nativeElement, "color", this.textColor);
		} else {
			this.renderer.setStyle(this.el.nativeElement, "color", "var(--ion-text-color-contrast)");
		}

		if (this.bgColor) {
			this.renderer.setStyle(this.el.nativeElement, "background-color", this.bgColor);
		} else {
			this.renderer.setStyle(this.el.nativeElement, "background-color", "var(--ion-background-color-contrast)");
		}

		// Mejorar el contraste de borde para botones y elementos interactivos
		const isButton = this.el.nativeElement.tagName === "BUTTON" || this.el.nativeElement.tagName === "ION-BUTTON";

		if (isButton) {
			this.renderer.setStyle(this.el.nativeElement, "border", "2px solid var(--ion-color-primary)");
			this.renderer.setStyle(this.el.nativeElement, "font-weight", "600");
		}

		// Mejorar la legibilidad del texto
		this.renderer.setStyle(this.el.nativeElement, "text-shadow", "0px 0px 1px rgba(0,0,0,0.3)");
	}
}
