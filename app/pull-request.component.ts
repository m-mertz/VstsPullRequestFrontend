import { Component, Input } from '@angular/core';
import { PullRequest, IPullRequest } from './pull-request';

@Component({
	selector: 'pull-request',
	templateUrl: 'app/pull-request.component.html'
})

export class PullRequestComponent {
	@Input()
	pullRequest : IPullRequest;
}