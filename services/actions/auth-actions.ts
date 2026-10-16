"use server";

import { auth } from "@/lib/auth/server";

export async function signOut() {
	return auth.signOut();
}
