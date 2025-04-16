import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HighContrastDirective } from "./directives/high-contrast.directive";

@NgModule({
	declarations: [],
	imports: [CommonModule, HighContrastDirective],
	exports: [HighContrastDirective],
})
export class SharedModule {}
