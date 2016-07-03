import { Component } from '@angular/core';
import { VisualStudioService, IPullRequestsResponse } from './visual-studio.service';
import { PullRequestComponent } from './pull-request.component';
import { IPullRequest } from './pull-request';

@Component({
	selector: 'main-app',
	templateUrl: 'app/main.component.html',
	providers: [VisualStudioService],
	directives: [PullRequestComponent]
})

export class AppComponent {
	private pullRequests : IPullRequest[] = null;

	constructor(private visualStudioService: VisualStudioService) {
	}

	loadPullRequests(username: string, password: string) : void {
		this.visualStudioService.getPullRequests(username, password)
			.then(response => {
				console.debug("Success: " + JSON.stringify(response));
				this.pullRequests = response.data;
			})
			.catch(error => {
				console.error("Error: " + JSON.stringify(error));
				this.pullRequests = null;
			});
	}
}