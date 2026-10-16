"use server";

import type { SignUpUser } from "@/app/signup/page";
import { auth } from "@/lib/auth/server";
import { LCUsernamePayload } from "@/models/user-model";
import { db } from "@/index";
import { userProfileTable } from "@/db/schema/user-profile-table";

export async function signUpWithEmail(signUpUser: SignUpUser) {
	const { error } = await auth.signUp.email({
		email: signUpUser.email,
		password: signUpUser.password,
		name: signUpUser.name,
	});

	if (error) {
		return { error: error.message || "Failed to create the user" };
	} else {
		return { error: null };
	}
}

export async function addLeetCodeUserName(
	payload: LCUsernamePayload,
): Promise<{ username: string }[]> {
	return await db
		.insert(userProfileTable)
		.values(payload)
		.returning({ username: userProfileTable.username });
}
