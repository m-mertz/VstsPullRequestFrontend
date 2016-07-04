import { IUserInfo } from './user-info';

export interface IBuildInfo {
	id: number,
	buildNumber: string,
	status: string,
	result: string,
	queueTime: string,
	startTime: string,
	finishTime: string,
	sourceBranch: string,
	sourceVersion: string,
	requestedFor: IUserInfo
}