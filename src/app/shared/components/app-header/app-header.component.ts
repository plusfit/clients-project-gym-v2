import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { IonicModule } from "@ionic/angular";

@Component({
	selector: "app-header",
	standalone: true,
	imports: [CommonModule, IonicModule],
	templateUrl: "./app-header.component.html",
	styleUrls: ["./app-header.component.scss"],
})
export class AppHeaderComponent {
	@Input() title = "";
	@Input() defaultHref = "/tabs/home";
	@Input() showBackButton = true;
	@Input() color = "dark";
}
