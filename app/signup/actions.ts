"use server";

import { testTable } from "@/db/schema";
import { db } from "@/index";
import type { SignUpUser } from "@/app/signup/page";
import { auth } from "@/lib/auth/server";

export async function fetchTestRows() {
  return db.select().from(testTable);
}

export async function signUpWithEmail(signUpUser: SignUpUser) {
  const { error } = await auth.signUp.email({
    email: signUpUser.email,
    password: signUpUser.password,
    name: signUpUser.name,
  });

  if (error) {
    return { error: error.message || "Failed to create the user" };
  }
}
