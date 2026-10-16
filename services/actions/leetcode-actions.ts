"use server";

import type { Problem } from "@/models/leetcode/problem-model";
import { db } from "@/index";
import { difficulty, problemsTable } from "@/db/schema/problems";
import { handleErrorWithBooleanReturn } from "@/services/actions/post-action";
import { userProfileTable } from "@/db/schema/user-profile-table";
import { eq } from "drizzle-orm";

export const insertProblems = async (problems: Problem[]): Promise<boolean> => {
	try {
		if (problems.length === 0) return false;

		const rows: (typeof problemsTable.$inferInsert)[] = problems.map(
			(problem) => {
				if (
					!Number.isInteger(problem.id) ||
					problem.id <= 0 ||
					problem.id > 2147483647
				) {
					throw new Error("Invalid LeetCode problem ID");
				}
				if (
					typeof problem.title !== "string" ||
					problem.title.length > 255 ||
					typeof problem.titleSlug !== "string" ||
					problem.titleSlug.length > 255
				) {
					throw new Error(
						"Problem title and slug must be strings of at most 255 characters",
					);
				}
				const problemDifficulty = difficulty.enumValues.find(
					(value) => value === problem.difficulty,
				);
				if (!problemDifficulty) throw new Error("Invalid problem difficulty");

				return {
					lcID: problem.id,
					title: problem.title,
					titleSlug: problem.titleSlug,
					url: problem.url,
					topics: problem.topics,
					difficulty: problemDifficulty,
				};
			},
		);

		await db
			.insert(problemsTable)
			.values(rows)
			.onConflictDoNothing({ target: problemsTable.lcID });
		return true;
	} catch (error) {
		// Drizzle's wrapper message includes the entire query; log the underlying error instead.
		handleErrorWithBooleanReturn(error);
		return false;
	}
};

export const fetchUsernameFromEmail = async (
	email: string,
): Promise<{ username: string }> => {
	const userRecord = await db
		.select({
			username: userProfileTable.username,
		})
		.from(userProfileTable)
		.where(eq(userProfileTable.email, email));

	return userRecord[0];
};
