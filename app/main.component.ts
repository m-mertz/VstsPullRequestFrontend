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
	private errors: Array<string> = [];

	public constructor(private visualStudioService: VisualStudioService) {
	}

	public loadPullRequests(username: string, password: string) : void {
		this.pullRequests = this.builds = null;

		this.visualStudioService.getPullRequests(username, password)
			.then(response => {
				this.pullRequests = response.data.map(src => new PullRequest(src));

				if (this.pullRequests.length > 0) {
					this.loadBuildsForPullRequests(username, password);
				}
			})
			.catch(error => {
				console.error("Error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading pull requests");
				this.pullRequests = null;
			});
	}

	private loadBuildsForPullRequests(username: string, password: string) : void {
		this.visualStudioService.getBuildsForUser(username, password)
			.then(response => {
				this.builds = response.data;
				this.pullRequests.forEach(pullRequest => pullRequest.extractBuilds(this.builds));
			})
			.catch(error => {
				console.error("Error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading builds");
				this.builds = null;
			})
	}
}