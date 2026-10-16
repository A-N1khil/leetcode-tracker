export interface APIContributionResponse {
	activeYears: number[];
	streak: number;
	totalActiveDays: number;
	submissionCalendar: Record<string, number>;
}
