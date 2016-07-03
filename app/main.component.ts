import { Component } from '@angular/core';
import { VisualStudioService, IPullRequestsResponse } from './visual-studio.service';
import { PullRequestComponent } from './pull-request.component';
import { PullRequest } from './pull-request';
import { IBuildInfo } from './build-info';

@Component({
	selector: 'main-app',
	templateUrl: 'app/main.component.html',
	providers: [VisualStudioService],
	directives: [PullRequestComponent]
})

export class AppComponent {
	private pullRequests: PullRequest[] = null;
	private builds: IBuildInfo[] = null;

	public constructor(private visualStudioService: VisualStudioService) {
	}

	public loadPullRequests(username: string, password: string) : void {
		this.pullRequests = this.builds = null;

		this.visualStudioService.getPullRequests(username, password)
			.then(response => {
				console.debug("Success: " + JSON.stringify(response));
				this.pullRequests = response.data.map(src => new PullRequest(src));

				if (this.pullRequests.length > 0) {
					this.loadBuildsForPullRequests(username, password);
				}
			})
			.catch(error => {
				console.error("Error: " + JSON.stringify(error));
				this.pullRequests = null;
			});
	}

	private loadBuildsForPullRequests(username: string, password: string) : void {
		this.visualStudioService.getBuildsForUser(username, password)
			.then(response => {
				console.debug("Success: " + JSON.stringify(response));
				this.builds = response.data;
				this.pullRequests.forEach(pullRequest => pullRequest.extractBuilds(this.builds));
			})
			.catch(error => {
				console.error("Error: " + JSON.stringify(error));
				this.builds = null;
			})
	}
}