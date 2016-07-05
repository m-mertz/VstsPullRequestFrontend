import { Injectable } from '@angular/core';
import { VisualStudioConfig } from './visual-studio.config';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IPullRequest } from './pull-request';
import { IBuildInfo } from './build-info';
import { IUserInfo } from './user-info';
import { IProjectInfo } from './project-info';

export interface IPullRequestsResponse {
	success: boolean,
	data: IPullRequest[],
	error: any
}

export interface IBuildsResponse {
	success: boolean,
	data: IBuildInfo[],
	error: any
}

@Injectable()
export class VisualStudioService {
	public getProjects(account: string, username: string, password: string) : Promise<IProjectInfo[]> {
		return this.http.get(this.getProjectsUrl(account), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => response.json().value)
			.catch((error: any) => Promise.reject<IProjectInfo[]>(error));
	}

	public getPullRequests(account: string, username: string, password: string) : Promise<IPullRequestsResponse> {
		let cachedUserId: string = this.userIdByUserName[username];
		let userIdPromise: Promise<string> = cachedUserId
			? Promise.resolve<string>(cachedUserId)
			: this.getUserId(account, username, password);

		return userIdPromise
			.then(userId => {
				this.userIdByUserName[username] = userId;
				return this.http.get(this.pullRequestsCreatedByUserUrl(account, userId), { headers: this.buildHeaders(username, password) })
					.toPromise()
					.then((response: Response) => <IPullRequestsResponse>{ success: true, data: response.json().value, error: null })
					.catch((error: any) => Promise.reject<IPullRequestsResponse>({ success: false, data: null, error: error }));
			})
			.catch((error: any) => Promise.reject<IPullRequestsResponse>({ success: false, data: null, error: error }));
	}

	public getBuildsForUser(account: string, username: string, password: string) : Promise<IBuildsResponse> {
		return this.http.get(this.buildsForUserUrl(account, username, VisualStudioConfig.buildQueue, null), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => <IBuildsResponse>{ success: true, data: response.json().value, error: null })
			.catch((error: any) => Promise.reject<IBuildsResponse>({ success: false, data: null, error: error }));
	}

	private getUserId(account: string, username: string, password: string) : Promise<string> {
		// Profile APIs that would expose the user id directly are only accessible through OAuth.
		// Retrieving a random build of the given user for now, which contains the user id.
		return this.http.get(this.buildsForUserUrl(account, username, null, 1), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => {
				let result: IBuildInfo[] = response.json().value;
				let id: string = result[0].requestedFor.id;
				if (id) {
					return id;
				} else {
					console.error("Failed to parse user id from response: " + JSON.stringify(response));
					return Promise.reject<string>("Invalid response from server, could not retrieve ID for user " + username);
				}
			});
	}

	private getProjectsUrl(account: string) : string {
		return "https://" + account + ".visualstudio.com/_apis/projects?api-version=1.0&stateFilter=WellFormed";
	}

	private pullRequestsCreatedByUserUrl(account: string, userId: string) : string {
		return 'https://' + account + '.visualstudio.com/_apis/git/repositories/' +
			VisualStudioConfig.repository + '/pullRequests?api-version=1.0-preview.1&creatorId=' + userId + '&status=All';
	}

	private buildsForUserUrl(account: string, username: string, buildQueue: string, top: number): string {
		let url: string = 'https://' + account + '.visualstudio.com/DefaultCollection/' +
			VisualStudioConfig.team + '/_apis/build/builds?api-version=2.0&requestedFor=' + username;

		if (buildQueue) {
			url = url + '&queue=' + buildQueue;
		}

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