"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const signupDetailedSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain an uppercase character")
      .regex(/[a-z]/, "Password must contain a lowercase character")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupDetailedFormValues = z.infer<typeof signupDetailedSchema>;

export default function SignupDetailedForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupDetailedFormValues>({
    resolver: zodResolver(signupDetailedSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control, name: "password" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });

  const passwordRules = [
    {
      label: "Must be at least 8 characters long",
      passed: password.length >= 8,
    },
    {
      label: "Must have an uppercase character",
      passed: /[A-Z]/.test(password),
    },
    {
      label: "Must have a lowercase character",
      passed: /[a-z]/.test(password),
    },
    {
      label: "Must have a number",
      passed: /[0-9]/.test(password),
    },
  ];

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;



  return (
    <>
      <Card {...props}>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your information below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(() => {})} noValidate>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.firstName)}>
                  <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="John"
                    autoComplete="given-name"
                    aria-invalid={Boolean(errors.firstName)}
                    {...register("firstName")}
                  />
                  <FieldError errors={[errors.firstName]} />
                </Field>
                <Field data-invalid={Boolean(errors.lastName)}>
                  <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Doe"
                    autoComplete="family-name"
                    aria-invalid={Boolean(errors.lastName)}
                    {...register("lastName")}
                  />
                  <FieldError errors={[errors.lastName]} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" value={email} disabled readOnly />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your email with anyone else.
                </FieldDescription>
              </Field>
              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                {password.length > 0 && (
                  <ul className="space-y-1 text-sm" aria-label="Password rules">
                    {passwordRules.map((rule) => (
                      <li key={rule.label} className={rule.passed ? "text-green-600" : "text-destructive"}>
                        {rule.passed ? (
                          <Check className="inline size-4" aria-hidden="true" />
                        ) : (
                          <X className="inline size-4" aria-hidden="true" />
                        )}{" "}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </Field>
              <Field data-invalid={Boolean(errors.confirmPassword)}>
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  {...register("confirmPassword")}
                />
                {confirmPassword.length > 0 && (
                  <p className={passwordsMatch ? "text-sm text-green-600" : "text-sm text-destructive"} role="status">
                    {passwordsMatch ? (
                      <Check className="inline size-4" aria-hidden="true" />
                    ) : (
                      <X className="inline size-4" aria-hidden="true" />
                    )}{" "}
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </Field>
              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={!isValid || isSubmitting}>
                    Create Account
                  </Button>
                  <Button variant="outline" type="button">
                    Sign up with Google
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account? <a href="#">Sign in</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
