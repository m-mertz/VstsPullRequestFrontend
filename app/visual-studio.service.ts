import { Injectable } from '@angular/core';
import { VisualStudioConfig } from './visual-studio.config';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

export interface IPullRequestsResponse {
	success: boolean,
	data: IPullRequest[],
	error: any
}

export interface IPullRequest {
	pullRequestId: number,
	status: string,
	title: string,
	description: string,
	mergeStatus: string
}

@Injectable()
export class VisualStudioService {
	private pullRequestsUrl: string = 'https://' + VisualStudioConfig.domain + '.visualstudio.com/_apis/git/repositories/' +
		VisualStudioConfig.repository + '/pullRequests?api-version=1.0-preview.1&creatorId=' + VisualStudioConfig.creatorId + '&status=All';

	constructor(private http: Http) {
	}

	public getPullRequests(username: string, password: string) : Promise<IPullRequestsResponse> {
		let headers: Headers = new Headers({
			'Accept': 'application/json',
			'Authorization': 'Basic ' + btoa(username + ":" + password)
		});

		return this.http.get(this.pullRequestsUrl, { headers: headers })
			.toPromise()
			.then((response: Response) => <IPullRequestsResponse>{ success: true, data: response.json().value, error: null })
			.catch(this.handleError);
	}

	private handleError(error: any) : Promise<IPullRequestsResponse> {
		console.error('An error occurred', error);
		let response: IPullRequestsResponse = { success: false, data: null, error: error.message || error };
		return Promise.reject<IPullRequestsResponse>(response);
	}
}