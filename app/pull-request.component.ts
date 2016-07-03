import { Component, Input } from '@angular/core';
import { PullRequest } from './pull-request';
import { BuildInfoComponent } from './build-info.component';

@Component({
	selector: 'pull-request',
	templateUrl: 'app/pull-request.component.html',
	directives: [BuildInfoComponent]
})

export class PullRequestComponent {
	@Input()
	public pullRequest: PullRequest;
}