import { Injectable } from '@angular/core';
import { VisualStudioConfig } from './visual-studio.config';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IPullRequest } from './pull-request'
import { IBuildInfo } from './build-info'

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
	private pullRequestsUrl: string = 'https://' + VisualStudioConfig.domain + '.visualstudio.com/_apis/git/repositories/' +
		VisualStudioConfig.repository + '/pullRequests?api-version=1.0-preview.1&creatorId=' + VisualStudioConfig.creatorId + '&status=All';

	private buildsForUserUrl(username: string): string {
		return 'https://' + VisualStudioConfig.domain + '.visualstudio.com/DefaultCollection/' +
			VisualStudioConfig.team + '/_apis/build/builds?api-version=2.0&queue=' + VisualStudioConfig.buildQueue + '&requestedFor=' + username;
	}

	constructor(private http: Http) {
	}

	private buildHeaders(username: string, password: string) : Headers {
		return new Headers({
			'Accept': 'application/json',
			'Authorization': 'Basic ' + btoa(username + ":" + password)
		});
	}

	public getPullRequests(username: string, password: string) : Promise<IPullRequestsResponse> {
		return this.http.get(this.pullRequestsUrl, { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => <IPullRequestsResponse>{ success: true, data: response.json().value, error: null })
			.catch((error: any) => Promise.reject<IPullRequestsResponse>({ success: false, data: null, error: error }));
	}

	public getBuildsForUser(username: string, password: string) : Promise<IBuildsResponse> {
		return this.http.get(this.buildsForUserUrl(username), { headers: this.buildHeaders(username, password) })
			.toPromise()
			.then((response: Response) => <IBuildsResponse>{ success: true, data: response.json().value, error: null })
			.catch((error: any) => Promise.reject<IBuildsResponse>({ success: false, data: null, error: error }));
	}
}