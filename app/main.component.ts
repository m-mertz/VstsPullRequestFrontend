import { Component } from '@angular/core';
import { VisualStudioService, IPullRequestsResponse } from './visual-studio.service';
import { PullRequestComponent } from './pull-request.component';
import { PullRequest } from './pull-request';
import { IBuildInfo } from './build-info';
import { IProjectInfo } from './project-info';
import { IRepositoryInfo } from './repository-info';

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
	private selectedProjectId: string = null;
	private repositories: IRepositoryInfo[] = [];
	private selectedRepositoryId: string = null;

	public constructor(private visualStudioService: VisualStudioService) {
	}

	public loadProjects() : void {
		this.clearErrors();
		this.projects = this.selectedProjectId = null;

		this.visualStudioService.getProjects(this.account, this.username, this.password)
			.then(response => {
				this.projects = response.sort((a, b) =>
					a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0));

				if (this.projects.length > 0) {
					this.selectedProjectId = this.projects[0].id;
					this.loadRepositories(this.selectedProjectId);
				}
			})
			.catch(error => {
				console.error("loadProjects() error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading projects");
			});
	}

	public onSelectedProjectChange(event: Event) : void {
		// Need to get selected project ID from event parameter instead of reading this.selectedProjectId.
		// The latter isn't updated as quickly as the event fires, so we'd get weird behavior.
		this.loadRepositories((<HTMLSelectElement>event.target).value);
	}

	private loadRepositories(projectId: string) : void {
		this.repositories = this.selectedRepositoryId = null;

		this.visualStudioService.getRepositories(this.account, this.username, this.password, projectId)
			.then(response => {
				this.repositories = response.sort((a, b) =>
					a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0));

				if (this.repositories.length > 0) {
					this.selectedRepositoryId = this.repositories[0].id;
				}
			})
			.catch(error => {
				console.error("loadRepositories() error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading repositories");
			});
	}

	public loadPullRequests() : void {
		this.clearErrors();
		this.pullRequests = this.builds = null;

		this.visualStudioService.getPullRequests(this.account, this.username, this.password, this.selectedProjectId, this.selectedRepositoryId)
			.then(response => {
				this.pullRequests = response.data.map(src => new PullRequest(src));

				if (this.pullRequests.length > 0) {
					this.loadBuildsForPullRequests(this.account, this.username, this.password);
				}
			})
			.catch(error => {
				console.error("loadPullRequests() error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading pull requests");
			});
	}

	private loadBuildsForPullRequests(account: string, username: string, password: string) : void {
		this.builds = null;
		this.pullRequests.forEach(pullRequest => pullRequest.clearBuilds());

		this.visualStudioService.getBuildsForUser(account, username, password, this.selectedProjectId)
			.then(response => {
				this.builds = response.data;
				this.pullRequests.forEach(pullRequest => pullRequest.extractBuilds(this.builds));
			})
			.catch(error => {
				console.error("loadBuildsForPullRequests() error: " + JSON.stringify(error));
				this.errors.push("An error occurred loading builds");
			})
	}

	private clearErrors() : void {
		this.errors = [];
	}
}