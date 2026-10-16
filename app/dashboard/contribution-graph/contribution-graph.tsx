"use client";

import { leetCodeFetchService } from "@/services/leetcode/leetcode-fetch-service";
import { useEffect, useRef, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
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
import { cn } from "cn";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectLabel,
	SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import {
	IconError404,
	IconCircleX,
	IconArrowUpRight,
	IconRefresh,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type ContributionGraphProps = {
	lcUsername: string;
};

type EmptyState = "Empty" | "Error" | "NotEmpty";

export default function DashboardContributionGraph({
	lcUsername,
}: ContributionGraphProps) {
	const [activeYears, setActiveYears] = useState<
		{
			label: string;
			value: number;
		}[]
	>([]);
	const [currentYear, setCurrentYear] = useState<number>(
		new Date().getFullYear(),
	);
	const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
	const [calendarData, setCalendarData] = useState<Activity[]>([]);
	const [emptyState, setEmptyState] = useState<EmptyState>("Empty");
	const graphContainerRef = useRef<HTMLDivElement>(null);
	const [graphWidth, setGraphWidth] = useState(0);
	const blockMargin = 4;
	const sortedDates = calendarData.map(({ date }) => date).sort();
	const firstDate = sortedDates[0];
	const lastDate = sortedDates[sortedDates.length - 1];
	const numberOfWeeks =
		firstDate && lastDate
			? Math.ceil(
					(differenceInCalendarDays(parseISO(lastDate), parseISO(firstDate)) +
						1 +
						parseISO(firstDate).getDay()) /
						7,
				)
			: 0;
	const blockSize =
		graphWidth > 0 && numberOfWeeks > 0
			? Math.max(
					1,
					(graphWidth - (numberOfWeeks - 1) * blockMargin) / numberOfWeeks,
				)
			: 12;

	useEffect(() => {
		const container = graphContainerRef.current;
		if (!container) return;

		const observer = new ResizeObserver(([entry]) => {
			if (entry) setGraphWidth(entry.contentRect.width);
		});
		observer.observe(container);
		return () => observer.disconnect();
	}, [showSkeleton, emptyState]);

	const router = useRouter();

	useEffect(() => {
		let ignore: boolean = false;
		function buildCalendarData(
			submissionCalendar: Record<string, number>,
		): Activity[] {
			const today: Date = new Date();
			const year: number = today.getFullYear();
			const start: Date = new Date(
				Date.UTC(currentYear === year ? year : currentYear, 0, 1),
			);
			const end: Date =
				currentYear === year ? today : new Date(Date.UTC(currentYear, 11, 31));

			const countsByDate = new Map<string, number>();

			for (const [timestamp, count] of Object.entries(submissionCalendar)) {
				const date: string = new Date(Number(timestamp) * 1000)
					.toISOString()
					.slice(0, 10);
				countsByDate.set(date, (countsByDate.get(date) ?? 0) + count);
			}

			const activities: Activity[] = [];

			for (
				const day = new Date(start);
				day <= end;
				day.setUTCDate(day.getUTCDate() + 1)
			) {
				const date = day.toISOString().slice(0, 10);

				activities.push({
					date,
					count: countsByDate.get(date) ?? 0,
					level: 0,
				});
			}

			const maxActivity = activities.reduce(
				(max, activity) => Math.max(max, activity.count),
				0,
			);

			return activities.map((activity) => ({
				...activity,
				level:
					maxActivity > 0 ? Math.ceil((activity.count / maxActivity) * 4) : 0,
			}));
		}

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
				const activeYearDropdownData: { label: string; value: number }[] = [];
				calendarResponse.activeYears
					.sort((a, b) => b - a)
					.map((value: number) => {
						activeYearDropdownData.push({
							label: value.toString(),
							value: value,
						});
					});
				setActiveYears(activeYearDropdownData);

				// set calendar data
				const activities = buildCalendarData(
					calendarResponse.submissionCalendar,
				);
				setCalendarData(activities);

				// show calendar
				setEmptyState("NotEmpty");
			} catch (err) {
				console.error(err);
				// set EmptyState to be Error
				if (!ignore) {
					if (err === "Calender returned null") {
						setEmptyState("Empty");
					} else {
						setEmptyState("Error");
					}
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

	function renderEmptyStateBlock() {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<IconError404 />
					</EmptyMedia>
					<EmptyTitle>No Activity Data Found</EmptyTitle>
					<EmptyDescription>
						It seems like you&apos;ve been asleep at the wheel for a long time.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button type={"button"} onClick={() => router.push("/problems")}>
						Find something to solve? <IconArrowUpRight />
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	function renderErrorStateBlock() {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant={"icon"}>
						<IconCircleX className="text-destructive" />
					</EmptyMedia>
					<EmptyTitle>Error fetching calendar data</EmptyTitle>
					<EmptyDescription>
						There was an error fetching your calendar data
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button type={"button"}>
						{" "}
						<IconRefresh />
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<>
			<Card className={"w-full w-max-sm"}>
				<CardHeader>
					{showSkeleton && <Skeleton className={"h-4 w-1/3"} />}
					{showSkeleton && <Skeleton className={"h-4 w-2/3"} />}
					{!showSkeleton && emptyState === "NotEmpty" && (
						<>
							<CardTitle>Your Activity</CardTitle>
							<CardDescription>
								Activity for the year {currentYear}
							</CardDescription>
							<CardAction>
								<Select items={activeYears}>
									<SelectTrigger className={"w-full max-w-48"}>
										<SelectValue>{currentYear}</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Active Years</SelectLabel>
											{activeYears.map((item) => (
												<SelectItem
													key={item.value}
													value={item.value}
													onClick={() => setCurrentYear(item.value)}
												>
													{item.label}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</CardAction>
						</>
					)}
				</CardHeader>
				{!showSkeleton && (
					<CardContent>
						{emptyState === "Error" && renderErrorStateBlock()}
						{emptyState === "Empty" && renderEmptyStateBlock()}
						{emptyState === "NotEmpty" && (
							<div ref={graphContainerRef} className="w-full min-w-0">
								<ContributionGraph
									data={calendarData}
									className="w-full"
									blockSize={blockSize}
									blockMargin={blockMargin}
								>
									<ContributionGraphCalendar>
										{({ activity, dayIndex, weekIndex }) => (
											<Tooltip>
												<TooltipTrigger render={<g tabIndex={0} />}>
													<ContributionGraphBlock
														activity={activity}
														dayIndex={dayIndex}
														weekIndex={weekIndex}
														className={cn(
															'data-[level="1"]:fill-[#9be9a8] dark:data-[level="1"]:fill-[#0e4429]',
															'data-[level="2"]:fill-[#40c463] dark:data-[level="2"]:fill-[#006d32]',
															'data-[level="3"]:fill-[#30a14e] dark:data-[level="3"]:fill-[#26a641]',
															'data-[level="4"]:fill-[#216e39] dark:data-[level="4"]:fill-[#39d353]',
															"cursor-pointer",
														)}
													/>
												</TooltipTrigger>
												<TooltipContent>
													<p className={"font-semibold"}>{activity.date}</p>
													<p>{activity.count} contributions</p>
												</TooltipContent>
											</Tooltip>
										)}
									</ContributionGraphCalendar>
									<ContributionGraphFooter>
										<ContributionGraphTotalCount />
										<ContributionGraphLegend>
											{({ level }) => (
												<div
													className="group relative flex h-3 w-3 items-center justify-center"
													data-level={level}
												>
													<div
														className={`h-full w-full rounded-sm border border-border 
														${level === 0 ? "bg-muted" : ""} 
														${level === 1 ? "bg-emerald-200 dark:bg-emerald-900" : ""} 
														${level === 2 ? "bg-emerald-400 dark:bg-emerald-700" : ""} 
														${level === 3 ? "bg-emerald-600 dark:bg-emerald-500" : ""} 
														${level === 4 ? "bg-emerald-800 dark:bg-emerald-300" : ""} `}
													/>
													<span className="-top-8 absolute hidden rounded bg-popover px-2 py-1 text-popover-foreground text-xs shadow-md group-hover:block">
														Level {level}
													</span>
												</div>
											)}
										</ContributionGraphLegend>
									</ContributionGraphFooter>
								</ContributionGraph>
							</div>
						)}
					</CardContent>
				)}
			</Card>
		</>
	);
}
