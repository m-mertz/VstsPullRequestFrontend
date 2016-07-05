import { Component } from '@angular/core';
import { VisualStudioService, IPullRequestsResponse } from './visual-studio.service';
import { PullRequestComponent } from './pull-request.component';
import { PullRequest } from './pull-request';
import { IBuildInfo } from './build-info';
import { IProjectInfo } from './project-info';

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
	private account: string;
	private username: string;
	// TODO: not sure if there's any security concerns about storing password in JS longer than necessary?
	// better to only pass in from input field when calling a function?
	private password: string;
	private projects: IProjectInfo[] = [];
	private selectedProjectId: string;

	public constructor(private visualStudioService: VisualStudioService) {
	}

	public login() : void {
		this.visualStudioService.getProjects(this.account, this.username, this.password)
			.then(response => {
				this.projects = response.sort((a, b) =>
					a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0));
				this.selectedProjectId = this.projects[0].id;
			})
			.catch(error => {
				console.error("login() error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading projects");
				this.projects = [];
			});
	}

	public loadPullRequests() : void {
		this.pullRequests = this.builds = null;

		this.visualStudioService.getPullRequests(this.account, this.username, this.password)
			.then(response => {
				this.pullRequests = response.data.map(src => new PullRequest(src));

				if (this.pullRequests.length > 0) {
					this.loadBuildsForPullRequests(this.account, this.username, this.password);
				}
			})
			.catch(error => {
				console.error("loadPullRequests() error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading pull requests");
				this.pullRequests = null;
			});
	}

	private loadBuildsForPullRequests(account: string, username: string, password: string) : void {
		this.visualStudioService.getBuildsForUser(account, username, password)
			.then(response => {
				this.builds = response.data;
				this.pullRequests.forEach(pullRequest => pullRequest.extractBuilds(this.builds));
			})
			.catch(error => {
				console.error("loadBuildsForPullRequests() error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading builds");
				this.builds = null;
			})
	}
}