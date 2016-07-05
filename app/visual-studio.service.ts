import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IPullRequest } from './pull-request';
import { IBuildInfo } from './build-info';
import { IUserInfo } from './user-info';
import { IProjectInfo } from './project-info';
import { IRepositoryInfo } from './repository-info';

@Injectable()
export class VisualStudioService {
	public getProjects(account: string, username: string, password: string) : Promise<IProjectInfo[]> {
		return this.http.get(this.getProjectsUrl(account), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => response.json().value)
			.catch((error: any) => Promise.reject<IProjectInfo[]>(error));
	}

	public getRepositories(account: string, username: string, password: string, projectId: string) : Promise<IRepositoryInfo[]> {
		return this.http.get(this.getRepositoriesUrl(account, projectId), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => response.json().value)
			.catch((error: any) => Promise.reject<IRepositoryInfo[]>(error));
	}

	public getPullRequests(account: string, username: string, password: string, projectId: string, repositoryId: string) : Promise<IPullRequest[]> {
		let cachedUserId: string = this.userIdByUserName[username];
		let userIdPromise: Promise<string> = cachedUserId
			? Promise.resolve<string>(cachedUserId)
			: this.getUserId(account, username, password, projectId);

		return userIdPromise
			.then(userId => {
				this.userIdByUserName[username] = userId;
				return this.http.get(this.pullRequestsCreatedByUserUrl(account, userId, repositoryId), { headers: this.buildHeaders(username, password) })
					.toPromise()
					.then((response: Response) => response.json().value)
					.catch((error: any) => Promise.reject<IPullRequest[]>(error));
			})
			.catch((error: any) => Promise.reject<IPullRequest[]>(error));
	}

	public getBuildsForUser(account: string, username: string, password: string, projectId: string) : Promise<IBuildInfo[]> {
		return this.http.get(this.buildsForUserUrl(account, username, projectId, null), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => response.json().value)
			.catch((error: any) => Promise.reject<IBuildInfo[]>(error));
	}

	private getUserId(account: string, username: string, password: string, projectId: string) : Promise<string> {
		// Profile APIs that would expose the user id directly are only accessible through OAuth.
		// Retrieving a random build of the given user for now, which contains the user id.
		return this.http.get(this.buildsForUserUrl(account, username, projectId, 1), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => {
				let builds: IBuildInfo[] = response.json().value;
				if (builds.length > 0 && builds[0].requestedFor.id) {
					return builds[0].requestedFor.id;
				} else {
					console.error("Failed to parse user id from response: " + JSON.stringify(response));
					return Promise.reject<string>("Invalid response from server, could not retrieve ID for user " + username);
				}
			})
			.catch((error: any) => Promise.reject<string>(error));
	}

	private getProjectsUrl(account: string) : string {
		return "https://" + account + ".visualstudio.com/_apis/projects?api-version=1.0&stateFilter=WellFormed";
	}

	private getRepositoriesUrl(account: string, projectId: string) : string {
		return "https://" + account + ".visualstudio.com/" + projectId + "/_apis/git/repositories?api-version=1.0";
	}

	private pullRequestsCreatedByUserUrl(account: string, userId: string, repositoryId: string) : string {
		return 'https://' + account + '.visualstudio.com/_apis/git/repositories/' + repositoryId +
			'/pullRequests?api-version=1.0-preview.1&creatorId=' + userId + '&status=All';
	}

	private buildsForUserUrl(account: string, username: string, projectId: string, top: number): string {
		let url: string = 'https://' + account + '.visualstudio.com/' + projectId +
			'/_apis/build/builds?api-version=2.0&requestedFor=' + username;

		if (top) {
			url = url + '&$top=' + top;
		}

		return url;
	}

	private buildHeaders(username: string, password: string) : Headers {
		return new Headers({
			'Accept': 'application/json',
			'Authorization': 'Basic ' + btoa(username + ":" + password)
		});
	}

	constructor(private http: Http) {
	}

	// TODO: This needs to be indexed by account as well, otherwise we mix up user IDs for the same user name but different accounts.
	private userIdByUserName: any = {};
}