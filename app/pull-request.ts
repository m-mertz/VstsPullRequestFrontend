import { IBuildInfo } from './build-info';

export interface IPullRequest {
	pullRequestId: number,
	title: string,
	description: string,
	status: string,
	mergeStatus: string
}

export class PullRequest implements IPullRequest {
	public pullRequestId: number;
	public title: string;
	public description: string;
	public status: string;
	public mergeStatus: string;
	public builds: IBuildInfo[];

	public constructor(src: IPullRequest) {
		this.pullRequestId = src.pullRequestId;
		this.title = src.title;
		this.description = src.description;
		this.status = src.status;
		this.mergeStatus = src.mergeStatus;
		this.builds = null;
	}

	public extractBuilds(builds: IBuildInfo[]) : void {
		this.builds = [];

		if (!builds) {
			return;
		}

		builds.forEach(build => {
			if (build && build.sourceBranch == 'refs/pull/' + this.pullRequestId + '/merge') {
				this.builds.push(build);
			}
		});
	}
}