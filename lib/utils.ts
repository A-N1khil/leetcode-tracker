export { cn } from "cn";

export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
