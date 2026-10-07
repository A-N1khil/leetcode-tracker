"use server";

import type { UserLogin } from "@/components/login-form";
import { auth } from "@/lib/auth/server";

export async function loginUser(loginUser: UserLogin) {
  const { data, error } = await auth.signIn.email({
    email: loginUser.email,
    password: loginUser.password,
  });

  if (error) {
    return { error: error.message || "Login Failed" };
  }
}
