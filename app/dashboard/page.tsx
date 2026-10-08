"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { leetCodeFetchService } from "@/services/leetcode/leetcode-fetch-service";

import { delay } from "@/lib/utils";
import data from "./data.json";
import { useEffect, useState } from "react";
import { Problem } from "@/models/problem-model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { IconCircleCheck, IconHourglassEmpty, IconPlaystationX } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

type RefreshStatus = "Loading" | "Done" | "Waiting" | "Error";
type FetchProblemStatus = "Need" | "Done" | "Retry";

const refreshStatusIconMap = {
  Loading: <Spinner />,
  Waiting: <IconHourglassEmpty />,
  Done: <IconCircleCheck className="text-primary" />,
  Error: <IconPlaystationX className="text-destructive" />,
};

export default function Page() {
  const [fetchStatus, setFetchStatus] = useState<RefreshStatus>("Waiting");
  const [dbRefreshStatus, setDBRefreshStatus] = useState<RefreshStatus>("Waiting");
  const [showDialog, setShowDialog] = useState<boolean>(true);
  const [fetchProblems, setFetchProblems] = useState<FetchProblemStatus>("Need");

  useEffect(() => {
    const fetchProblemsFunc = async () => {
      try {
        await delay(1000);
        setShowDialog(true);

        await delay(1000);
        setFetchStatus("Loading");

        await delay(3000);
        setFetchStatus("Done");
        setDBRefreshStatus("Loading");

        await delay(3000);
        setDBRefreshStatus("Error");

        setFetchProblems("Done");
      } catch (error) {
        setFetchStatus("Error");
        setDBRefreshStatus("Error");
      } finally {
        // setShowDialog(false);
      }
    };
    if (["Need", "Retry"].includes(fetchProblems)) {
      void fetchProblemsFunc();
    }
  }, [fetchProblems]);

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
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Dialog open={showDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Refreshing LeetCode Problems...</DialogTitle>
            <DialogDescription render={<div />}>
              <Marker className={"mt-4"}>
                <MarkerIcon>{refreshStatusIconMap[fetchStatus]}</MarkerIcon>
                <MarkerContent className={fetchStatus === "Loading" ? "shimmer" : ""}>
                  {fetchStatus === "Waiting" && "Waiting to fetch LeetCode problems..."}
                  {fetchStatus === "Loading" && "Fetching LeetCode problems..."}
                  {fetchStatus === "Done" && "LeetCode problems fetched successfully."}
                  {fetchStatus === "Error" && "Failed to fetch LeetCode problems."}
                </MarkerContent>
              </Marker>
              <Marker className={"mt-4"}>
                <MarkerIcon>{refreshStatusIconMap[dbRefreshStatus]}</MarkerIcon>
                <MarkerContent className={dbRefreshStatus === "Loading" ? "shimmer" : ""}>
                  {dbRefreshStatus === "Waiting" && "Waiting to refresh LeetCode problems..."}
                  {dbRefreshStatus === "Loading" && "Pushing problems into the database..."}
                  {dbRefreshStatus === "Done" && "Database refreshed successfully."}
                  {dbRefreshStatus === "Error" && "Failed to refresh the database."}
                </MarkerContent>
              </Marker>
            </DialogDescription>
          </DialogHeader>
          {["Done", "Error"].includes(fetchStatus) && ["Done", "Error"].includes(dbRefreshStatus) && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Close
              </Button>
              {dbRefreshStatus === "Error" && (
                <Button variant="destructive" onClick={() => setFetchProblems("Retry")}>
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
