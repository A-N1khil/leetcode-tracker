export interface SubmissionCount {
	difficulty: "All" | "Easy" | "Medium" | "Hard";
	count: number;
	submissions: number;
}

export interface SubmitStats {
	acSubmissionNum: SubmissionCount[];
	totalSubmissionNum: SubmissionCount[];
}
