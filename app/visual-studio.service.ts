import { Injectable } from '@angular/core';
import { VisualStudioConfig } from './visual-studio.config';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IPullRequest } from './pull-request';
import { IBuildInfo } from './build-info';
import { IUserInfo } from './user-info';

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
	public getPullRequests(username: string, password: string) : Promise<IPullRequestsResponse> {
		let cachedUserId: string = this.userIdByUserName[username];
		let userIdPromise: Promise<string> = cachedUserId
			? Promise.resolve<string>(cachedUserId)
			: this.getUserId(username, password);

		return userIdPromise
			.then(userId => {
				this.userIdByUserName[username] = userId;
				return this.http.get(this.pullRequestsCreatedByUserUrl(userId), { headers: this.buildHeaders(username, password) })
					.toPromise()
					.then((response: Response) => <IPullRequestsResponse>{ success: true, data: response.json().value, error: null })
					.catch((error: any) => Promise.reject<IPullRequestsResponse>({ success: false, data: null, error: error }));
			})
			.catch((error: any) => Promise.reject<IPullRequestsResponse>({ success: false, data: null, error: error }));
	}

	public getBuildsForUser(username: string, password: string) : Promise<IBuildsResponse> {
		return this.http.get(this.buildsForUserUrl(username, VisualStudioConfig.buildQueue, null), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => <IBuildsResponse>{ success: true, data: response.json().value, error: null })
			.catch((error: any) => Promise.reject<IBuildsResponse>({ success: false, data: null, error: error }));
	}

	private getUserId(username: string, password: string) : Promise<string> {
		return this.http.get(this.buildsForUserUrl(username, null, 1), { headers: this.buildHeaders(username, password) })
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

	private pullRequestsCreatedByUserUrl(userId: string) : string {
		return 'https://' + VisualStudioConfig.domain + '.visualstudio.com/_apis/git/repositories/' +
			VisualStudioConfig.repository + '/pullRequests?api-version=1.0-preview.1&creatorId=' + userId + '&status=All';
	}

	private buildsForUserUrl(username: string, buildQueue: string, top: number): string {
		let url: string = 'https://' + VisualStudioConfig.domain + '.visualstudio.com/DefaultCollection/' +
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

	private userIdByUserName: any = {};
}