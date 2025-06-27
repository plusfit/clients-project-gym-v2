import { Injectable } from "@angular/core";

// Declaración de tipos para reCAPTCHA
declare global {
	interface Window {
		grecaptcha: {
			ready: (callback: () => void) => void;
			execute: (siteKey: string, options: { action: string }) => Promise<string>;
		};
	}
}

declare const grecaptcha: typeof window.grecaptcha;

@Injectable({
	providedIn: "root",
})
export class RecaptchaService {
	private siteKey = ""; // Será configurado desde environment
	private isLoaded = false;
	private loadPromise: Promise<void> | null = null;

	/**
	 * Inicializa el servicio con la site key
	 */
	init(siteKey: string): void {
		this.siteKey = siteKey;
	}

	/**
	 * Carga el script de reCAPTCHA v3
	 */
	private loadRecaptchaScript(): Promise<void> {
		if (this.loadPromise) {
			return this.loadPromise;
		}

		this.loadPromise = new Promise((resolve, reject) => {
			if (this.isLoaded || (typeof window.grecaptcha !== "undefined" && window.grecaptcha)) {
				this.isLoaded = true;
				resolve();
				return;
			}

			// Crear el script element
			const script = document.createElement("script");
			script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
			script.async = true;
			script.defer = true;

			script.onload = () => {
				grecaptcha.ready(() => {
					this.isLoaded = true;
					// Ocultar el badge después de cargar
					this.hideBadge();
					resolve();
				});
			};

			script.onerror = () => {
				reject(new Error("Failed to load reCAPTCHA script"));
			};

			// Agregar al head del documento
			document.head.appendChild(script);
		});

		return this.loadPromise;
	}

	/**
	 * Ejecuta reCAPTCHA y retorna el token
	 */
	async executeRecaptcha(action: string): Promise<string> {
		if (!this.siteKey) {
			throw new Error("reCAPTCHA site key not configured. Call init() first.");
		}

		try {
			await this.loadRecaptchaScript();

			return new Promise((resolve, reject) => {
				grecaptcha.ready(() => {
					grecaptcha
						.execute(this.siteKey, { action })
						.then((token: string) => {
							resolve(token);
						})
						.catch((error: Error) => {
							reject(error);
						});
				});
			});
		} catch (error) {
			throw new Error(`reCAPTCHA execution failed: ${error}`);
		}
	}

	/**
	 * Verifica si reCAPTCHA está disponible
	 */
	isRecaptchaLoaded(): boolean {
		return this.isLoaded && typeof window.grecaptcha !== "undefined";
	}

	/**
	 * Oculta el badge de reCAPTCHA
	 */
	private hideBadge(): void {
		// Esperar un poco para que el badge se renderice
		setTimeout(() => {
			const badge = document.querySelector(".grecaptcha-badge");
			if (badge) {
				(badge as HTMLElement).style.visibility = "hidden";
				(badge as HTMLElement).style.opacity = "0";
				(badge as HTMLElement).style.pointerEvents = "none";
			}
		}, 100);
	}

	/**
	 * Muestra el badge de reCAPTCHA (si necesitas mostrarlo nuevamente)
	 */
	showBadge(): void {
		const badge = document.querySelector(".grecaptcha-badge");
		if (badge) {
			(badge as HTMLElement).style.visibility = "visible";
			(badge as HTMLElement).style.opacity = "1";
			(badge as HTMLElement).style.pointerEvents = "auto";
		}
	}

	/**
	 * Resetea el estado del servicio (útil para testing)
	 */
	reset(): void {
		this.isLoaded = false;
		this.loadPromise = null;
	}
}
