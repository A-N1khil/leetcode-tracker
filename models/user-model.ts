import { SubmitStats } from "@/models/submission-model";

export interface UserProfile {
	username: string;
	githubUrl?: string;
	twitterUrl?: string;
	linkedinUrl?: string;
	profile?: UserProfileMeta;
	submitStats?: SubmitStats;
	contestBadge?: unknown;
}

export interface UserProfileMeta {
	userAvatar?: string;
	realName?: string;
	websites?: string[];
	countryName?: string;
	company?: string;
	jobTitle?: string;
	skillTags?: string[];
	school?: string;
	aboutMe?: string;
	postViewCount?: number;
	postViewCountDiff?: number;
	reputation?: number;
	ranking?: number;
	reputationDiff?: number;
	solutionCount?: number;
	solutionCountDiff?: number;
	categoryDiscussCount?: number;
	categoryDiscussCountDiff?: number;
	certificationLevel?: string;
}

export interface LCUsernamePayload extends UserProfile {
	email: string;
}
