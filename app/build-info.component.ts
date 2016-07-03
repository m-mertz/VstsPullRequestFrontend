import { Component, Input } from '@angular/core';
import { IBuildInfo } from './build-info';

@Component({
	selector: 'build-info',
	templateUrl: 'app/build-info.component.html'
})

export class BuildInfoComponent {
	@Input()
	public build: IBuildInfo;

	private isFailed() : boolean {
		return this.build && this.build.status == "completed" && this.build.result == "failed";
	}

	private isSuccessful() : boolean {
		return this.build && this.build.status == "completed" && this.build.result == "succeeded";
	}
}