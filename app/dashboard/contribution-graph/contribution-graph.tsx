"use client";

import { leetCodeFetchService } from "@/services/leetcode/leetcode-fetch-service";
import { useEffect, useState } from "react";
import { type APIContributionResponse } from "@/models/leetcode/contribution-model";
import {
	type Activity,
	ContributionGraph,
	ContributionGraphBlock,
	ContributionGraphCalendar,
	ContributionGraphFooter,
	ContributionGraphLegend,
	ContributionGraphTotalCount,
} from "@/components/kibo-ui/contribution-graph";
import { formatISO } from "date-fns";

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
	const [calendarData, setCalendarData] = useState<Activity[]>([]);
	const [emptyState, setEmptyState] = useState<EmptyState>("Empty");

	const maxLevel: number = 4;

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

				const maxActivity: number = Object.values(
					calendarResponse.submissionCalendar,
				).reduce((max, count) => Math.max(max, count), 0);
				const activityData: Activity[] = Object.entries(
					calendarResponse.submissionCalendar,
				)
					.filter((value) => value[1] > 0)
					.map(([date, count]: [date: string, count: number]) => {
						return {
							date: formatISO(date, { representation: "date" }),
							count: count,
							level: Math.ceil(count / maxActivity) * maxLevel,
						};
					});

				// set calendar data
				setCalendarData(activityData);
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
			<ContributionGraph data={calendarData}>
				<ContributionGraphCalendar>
					{({ activity, dayIndex, weekIndex }) => (
						<ContributionGraphBlock
							activity={activity}
							dayIndex={dayIndex}
							weekIndex={weekIndex}
						/>
					)}
				</ContributionGraphCalendar>
				<ContributionGraphFooter>
					<ContributionGraphTotalCount />
					<ContributionGraphLegend />
				</ContributionGraphFooter>
			</ContributionGraph>
		</>
	);
}
