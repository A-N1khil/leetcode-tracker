"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import {
	IconCircleCheck,
	IconHourglassEmpty,
	IconPlaystationX,
} from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { insertProblems } from "@/services/actions/leetcode-actions";
import { leetCodeFetchService } from "@/services/leetcode/leetcode-fetch-service";

import { delay } from "@/lib/utils";

type RefreshStatus = "Loading" | "Done" | "Waiting" | "Error";

const refreshStatusIconMap = {
	Loading: <Spinner />,
	Waiting: <IconHourglassEmpty />,
	Done: <IconCircleCheck className="text-primary" />,
	Error: <IconPlaystationX className="text-destructive" />,
};

export default function Problems() {
	const [fetchStatus, setFetchStatus] = useState<RefreshStatus>("Waiting");
	const [dbRefreshStatus, setDBRefreshStatus] =
		useState<RefreshStatus>("Waiting");
	const [showDialog, setShowDialog] = useState<boolean>(true);
	const hasStarted = useRef(false);
	const refreshInProgress = useRef(false);

	const refreshProblems = useCallback(async () => {
		if (refreshInProgress.current) return;
		refreshInProgress.current = true;
		setFetchStatus("Waiting");
		setDBRefreshStatus("Waiting");

		let stage: "fetch" | "insert" = "fetch";
		try {
			await delay(1000);
			setShowDialog(true);

			await delay(1000);
			setFetchStatus("Loading");

			const problems = await leetCodeFetchService.getProblems();
			if (!Array.isArray(problems) || problems.length === 0) {
				throw new Error("LeetCode API returned no problems");
			}
			setFetchStatus("Done");

			stage = "insert";
			setDBRefreshStatus("Loading");
			const success = await insertProblems(problems);
			setDBRefreshStatus(success ? "Done" : "Error");
		} catch (error) {
			if (stage === "fetch") {
				setFetchStatus("Error");
			} else {
				setDBRefreshStatus("Error");
			}
			console.error(`Failed to ${stage} LeetCode problems`, error);
		} finally {
			refreshInProgress.current = false;
		}
	}, []);

	useEffect(() => {
		// React Strict Mode replays mount effects in development.
		if (hasStarted.current) return;
		hasStarted.current = true;
		void refreshProblems();
	}, [refreshProblems]);

	const refreshFailed = fetchStatus === "Error" || dbRefreshStatus === "Error";
	const refreshFinished = refreshFailed || dbRefreshStatus === "Done";

	return (
		<>
			<Dialog open={showDialog}>
				<DialogContent showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>Refreshing LeetCode Problems...</DialogTitle>
						<DialogDescription render={<div />}>
							<Marker className={"mt-4"}>
								<MarkerIcon>{refreshStatusIconMap[fetchStatus]}</MarkerIcon>
								<MarkerContent
									className={fetchStatus === "Loading" ? "shimmer" : ""}
								>
									{fetchStatus === "Waiting" &&
										"Waiting to fetch LeetCode problems..."}
									{fetchStatus === "Loading" && "Fetching LeetCode problems..."}
									{fetchStatus === "Done" &&
										"LeetCode problems fetched successfully."}
									{fetchStatus === "Error" &&
										"Failed to fetch LeetCode problems."}
								</MarkerContent>
							</Marker>
							<Marker className={"mt-4"}>
								<MarkerIcon>{refreshStatusIconMap[dbRefreshStatus]}</MarkerIcon>
								<MarkerContent
									className={dbRefreshStatus === "Loading" ? "shimmer" : ""}
								>
									{dbRefreshStatus === "Waiting" &&
										"Waiting to refresh LeetCode problems..."}
									{dbRefreshStatus === "Loading" &&
										"Pushing problems into the database..."}
									{dbRefreshStatus === "Done" &&
										"Database refreshed successfully."}
									{dbRefreshStatus === "Error" &&
										"Failed to refresh the database."}
								</MarkerContent>
							</Marker>
						</DialogDescription>
					</DialogHeader>
					{refreshFinished && (
						<DialogFooter>
							<Button variant="outline" onClick={() => setShowDialog(false)}>
								Close
							</Button>
							{refreshFailed && (
								<Button
									variant="destructive"
									onClick={() => void refreshProblems()}
								>
									Retry
								</Button>
							)}
						</DialogFooter>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
