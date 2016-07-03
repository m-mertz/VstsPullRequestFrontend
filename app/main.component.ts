import { Component } from '@angular/core';
import { VisualStudioService, IPullRequestsResponse } from './visual-studio.service';

@Component({
	selector: 'main-app',
	templateUrl: 'app/main.component.html',
	providers: [VisualStudioService]
})

export class AppComponent {
	constructor(private visualStudioService: VisualStudioService) {
	}

	loadPullRequests(username: string, password: string) : void {
		this.visualStudioService.getPullRequests(username, password)
			.then(response => console.debug("Success: " + JSON.stringify(response)))
			.catch(error => console.error("Error: " + JSON.stringify(error)));
	}
}