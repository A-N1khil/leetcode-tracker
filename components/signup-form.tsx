"use client";

import { cn } from "cn";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LoaderCircle, X } from "lucide-react";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import type { SignUpUser } from "@/app/signup/page";
import { addLeetCodeUserName, signUpWithEmail } from "@/app/signup/actions";
import { Toaster, toast } from "./ui/toast";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { leetCodeFetchService } from "@/services/leetcode/leetcode-fetch-service";
import { LCUsernamePayload } from "@/models/user-model";

const leetCodeUserNameSchema = z.object({
	lcUsername: z
		.string()
		.trim()
		.min(3, "LeetCode username must be at least 3 characters")
		.refine(
			async (username: string) => {
				if (username.length < 3) {
					return true;
				}
				try {
					await leetCodeFetchService.getUserProfile(username);
					return true;
				} catch {
					return false;
				}
			},
			{ message: "User Profile not found!" },
		),
});

const signUpSchema = z
	.object({
		name: z.string().trim().min(1, "Name is required"),
		email: z.email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z.string(),
		lcUsername: z
			.string()
			.trim()
			.min(3, "LeetCode username must be at least 3 characters"),
	})
	.refine((values) => values.password === values.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignupFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const {
		control,
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<SignupFormValues>({
		resolver: zodResolver(signUpSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			lcUsername: "",
		},
	});

	const router = useRouter();
	const { user, setUser } = useUser();

	const password = useWatch({ control, name: "password" });
	const confirmPassword = useWatch({ control, name: "confirmPassword" });
	const lcUsername = useWatch({ control, name: "lcUsername" });
	const [usernameValidation, setUsernameValidation] = React.useState<{
		username: string;
		status: "checking" | "valid" | "invalid";
		message?: string;
	} | null>(null);
	const normalizedUsername = lcUsername.trim();
	const currentValidation =
		usernameValidation?.username === normalizedUsername
			? usernameValidation
			: null;
	const usernameError =
		currentValidation?.status === "invalid"
			? currentValidation.message
			: errors.lcUsername?.message;

	useEffect(() => {
		if (normalizedUsername.length < 3) return;
		let ignore = false;
		const timer = window.setTimeout(async () => {
			setUsernameValidation({
				username: normalizedUsername,
				status: "checking",
			});
			const result = await leetCodeUserNameSchema.safeParseAsync({
				lcUsername: normalizedUsername,
			});
			if (ignore) return;
			setUsernameValidation({
				username: normalizedUsername,
				status: result.success ? "valid" : "invalid",
				message: result.success ? undefined : result.error.issues[0]?.message,
			});
		}, 400);
		return () => {
			ignore = true;
			window.clearTimeout(timer);
		};
	}, [normalizedUsername]);

	const passwordsMatch =
		confirmPassword.length > 8 && confirmPassword === password;

	async function handleCreateAccount(values: SignupFormValues) {
		if (
			currentValidation?.status !== "valid" ||
			currentValidation.username !== values.lcUsername
		)
			return;
		const signUpUser: SignUpUser = {
			name: values.name,
			email: values.email,
			password: values.password,
		};
		const createUserPromise = new Promise<void>((resolve) => {
			window.setTimeout(resolve, 1000);
		}).then(async () => {
			const { error } = await signUpWithEmail(signUpUser);
			if (error) {
				throw new Error(error);
			}

			const session = await authClient.getSession();
			if (session.error) {
				throw new Error(session.error.message ?? "Unable to load the session");
			}
			if (!session.data?.session || !session.data.user) {
				throw new Error("Login successful but no session found");
			}

			// Session found, insert user
			if (user?.email) {
				console.log("Inserting User...");
				const payload: LCUsernamePayload = {
					email: user.email,
					username: values.lcUsername,
				};

				await addLeetCodeUserName(payload);
			} else {
				console.log("No user email found");
			}

			setUser(session.data.user);
			router.replace("/dashboard");
		});

		await toast.promise(createUserPromise, {
			loading: {
				title: "Creating your account..",
				type: "loading",
				timeout: 0,
			},
			success: {
				title: "Account created successfully",
				type: "success",
				timeout: 5000,
			},
			error: (error: unknown) => ({
				title: "Unable to create account",
				description:
					error instanceof Error ? error.message : "Please try again",
				type: "error",
				timeout: 5000,
				priority: "high",
			}),
		});

		await createUserPromise.catch(() => {});
	}

	async function handleGoogleSignup() {
		// TODO: handle Google signup
	}

	return (
		<Toaster>
			<div className={cn("flex flex-col gap-6", className)} {...props}>
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Create your account</CardTitle>
						<CardDescription>
							Enter your email below to create your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(handleCreateAccount)} noValidate>
							<FieldGroup>
								<Field data-invalid={Boolean(errors.name)}>
									<FieldLabel htmlFor="name">Name</FieldLabel>
									<Input
										id="name"
										type="text"
										placeholder="John Doe"
										{...register("name")}
										aria-invalid={Boolean(errors.name)}
									/>
								</Field>
								<Field data-invalid={Boolean(errors.email)}>
									<FieldLabel htmlFor="email">Email</FieldLabel>
									<Input
										id="email"
										type="email"
										placeholder="m@example.com"
										required
										{...register("email")}
										aria-invalid={Boolean(errors.email)}
									/>
								</Field>
								<Field>
									<Field className="grid grid-cols-2 gap-4">
										<Field data-invalid={Boolean(errors.password)}>
											<FieldLabel htmlFor="password">Password</FieldLabel>
											<Input
												id="password"
												type="password"
												required
												{...register("password")}
											/>
										</Field>
										<Field data-invalid={Boolean(errors.confirmPassword)}>
											<FieldLabel htmlFor="confirm-password">
												Confirm Password
											</FieldLabel>
											<Input
												id="confirm-password"
												type="password"
												required
												{...register("confirmPassword")}
												aria-invalid={Boolean(errors.confirmPassword)}
											/>
											{confirmPassword.length > 0 && (
												<p
													className={
														passwordsMatch
															? "text-sm text-green-600"
															: "text-sm text-destructive"
													}
													role="status"
												>
													{passwordsMatch ? (
														<Check
															className="inline size-4"
															aria-hidden="true"
														/>
													) : (
														<X className="inline size-4" aria-hidden="true" />
													)}{" "}
													{passwordsMatch
														? "Passwords match"
														: "Passwords do not match"}
												</p>
											)}
										</Field>
									</Field>
									<FieldDescription>
										Must be at least 8 characters long.
									</FieldDescription>
								</Field>
								<Field data-invalid={Boolean(usernameError)}>
									<FieldLabel htmlFor="lcUsername">
										LeetCode Username
									</FieldLabel>
									<InputGroup>
										<InputGroupInput
											id="lcUsername"
											type="text"
											placeholder="Your LeetCode username"
											autoCapitalize="none"
											spellCheck={false}
											required
											{...register("lcUsername")}
											aria-invalid={Boolean(usernameError)}
											aria-describedby="lcUsername-status"
											aria-busy={currentValidation?.status === "checking"}
										/>
										<InputGroupAddon align="inline-end">
											{currentValidation?.status === "checking" && (
												<LoaderCircle
													className="size-4 animate-spin"
													aria-hidden="true"
												/>
											)}
											{currentValidation?.status === "valid" && (
												<Check
													className="size-4 text-green-600"
													aria-hidden="true"
												/>
											)}
										</InputGroupAddon>
									</InputGroup>
									<p
										id="lcUsername-status"
										role="status"
										className={cn(
											"text-sm",
											usernameError
												? "text-destructive"
												: "text-muted-foreground",
										)}
									>
										{usernameError ??
											(currentValidation?.status === "checking"
												? "Checking username..."
												: currentValidation?.status === "valid"
													? "LeetCode username verified"
													: "Enter at least 3 characters to verify your username.")}
									</p>
								</Field>
								<Field>
									<Button
										type="submit"
										disabled={
											!isValid ||
											isSubmitting ||
											currentValidation?.status !== "valid"
										}
									>
										Create Account
									</Button>
									<Button
										onClick={handleGoogleSignup}
										variant="outline"
										type="button"
									>
										<IconBrandGoogleFilled
											className="inline size-4"
											aria-hidden="true"
										/>
										Sign up with Google
									</Button>
									<FieldDescription className="text-center">
										Already have an account? <a href="#">Sign in</a>
									</FieldDescription>
								</Field>
							</FieldGroup>
						</form>
					</CardContent>
				</Card>
				<FieldDescription className="px-6 text-center">
					By clicking continue, you agree to our{" "}
					<a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
				</FieldDescription>
			</div>
		</Toaster>
	);
}
