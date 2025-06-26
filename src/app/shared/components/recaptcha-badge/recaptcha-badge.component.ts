import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
	selector: "app-recaptcha-badge",
	standalone: true,
	imports: [CommonModule],
	template: `
    <div class="recaptcha-badge" *ngIf="show">
      <div class="recaptcha-text">
        <span class="protected-text">Protegido por reCAPTCHA</span>
        <div class="policy-links">
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacidad</a>
          <span class="separator">-</span>
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Términos</a>
        </div>
      </div>
      <img 
        src="https://www.gstatic.com/recaptcha/api2/logo_48.png" 
        alt="reCAPTCHA" 
        class="recaptcha-logo"
      />
    </div>
  `,
	styles: [
		`
    .recaptcha-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      margin-top: 16px;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .recaptcha-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .protected-text {
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
    }

    .policy-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .policy-links a {
      color: var(--ion-color-primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .policy-links a:hover {
      color: var(--ion-color-primary-tint);
      text-decoration: underline;
    }

    .separator {
      color: rgba(255, 255, 255, 0.4);
    }

    .recaptcha-logo {
      width: 20px;
      height: 20px;
      opacity: 0.7;
    }

    @media (max-width: 480px) {
      .recaptcha-badge {
        font-size: 0.7rem;
        padding: 6px 10px;
        gap: 6px;
      }

      .recaptcha-logo {
        width: 18px;
        height: 18px;
      }
    }
  `,
	],
})
export class RecaptchaBadgeComponent {
	@Input() show = true;
}
