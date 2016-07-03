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

	constructor(pullRequestId: number, title: string, description: string, status: string, mergeStatus: string) {
		this.pullRequestId = pullRequestId;
		this.title = title;
		this.description = description;
		this.status = status;
		this.mergeStatus = mergeStatus;
	}
}