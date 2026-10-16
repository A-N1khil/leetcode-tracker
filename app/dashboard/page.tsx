"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import data from "./data.json";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { fetchUsernameFromEmail } from "@/services/actions/leetcode-actions";
import { email } from "zod";
import DashboardContributionGraph from "@/app/dashboard/contribution-graph/contribution-graph";

export default function Page() {
	const { user } = useUser();
	const [username, setUsername] = useState<string>();

	useEffect(() => {
		console.log(user);

		// Fetch username from DB
		async function fetchUserFromEmail(email: string) {
			const { username } = await fetchUsernameFromEmail(email);
			console.log(username);
			setUsername(username);
		}

		if (user) {
			void fetchUserFromEmail(user.email as string);
		}
	}, [user?.email]);

	return (
		<>
			<SidebarProvider
				style={
					{
						"--sidebar-width": "calc(var(--spacing) * 72)",
						"--header-height": "calc(var(--spacing) * 12)",
					} as React.CSSProperties
				}
			>
				<AppSidebar variant="inset" user={user} />
				<SidebarInset>
					<SiteHeader />
					<div className="flex flex-1 flex-col">
						<div className="@container/main flex flex-1 flex-col gap-2">
							<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
								<div className="px-4 lg:px-6">
									{username && (
										<DashboardContributionGraph lcUsername={username} />
									)}
								</div>
								<DataTable data={data} />
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}
