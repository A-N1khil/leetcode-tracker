"use client";

import { leetCodeFetchService } from "@/services/leetcode/leetcode-fetch-service";
import { useEffect, useState } from "react";
import { type APIContributionResponse } from "@/models/leetcode/contribution-model";
import { ContributionGraph } from "@/components/kibo-ui/contribution-graph";

type ContributionGraphProps = {
	lcUsername: string;
};

type EmptyState = "Empty" | "Error";

export default function DashboardContributionGraph({
	lcUsername,
}: ContributionGraphProps) {
	const [activeYears, setActiveYears] = useState<number[]>([]);
	const [currentYear, setCurrentYear] = useState<number>(
		new Date().getFullYear(),
	);
	const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
	const [calendarData, setCalendarData] = useState<Record<string, number>>({});
	const [emptyState, setEmptyState] = useState<EmptyState>("Empty");

	useEffect(() => {
		let ignore = false;

		async function getCalendar() {
			setShowSkeleton(true);
			setEmptyState("Empty");
			try {
				const calendarResponse: APIContributionResponse =
					await leetCodeFetchService.getCalendar(lcUsername, currentYear);

				if (!calendarResponse) {
					throw new Error("Calendar returned null");
				}
				if (ignore) return;

				// setActiveYears for the dropdown
				setActiveYears(calendarResponse.activeYears);

				// set calendar data
				setCalendarData(calendarResponse.submissionCalendar);
			} catch {
				// set EmptyState to be Error
				if (!ignore) {
					setEmptyState("Error");
				}
			} finally {
				if (!ignore) {
					setShowSkeleton(false);
				}
			}
		}
		void getCalendar();

		return () => {
			ignore = true;
		};
	}, [lcUsername, currentYear]);

	return (
		<>
			<ContributionGraph data={calendarData}></ContributionGraph>
		</>
	);
}
