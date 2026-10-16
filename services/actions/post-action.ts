export function handleErrorWithBooleanReturn(error: unknown) {
	const cause = error instanceof Error && error.cause ? error.cause : error;
	console.error(
		"Failed to insert LeetCode problems:",
		cause instanceof Error ? cause.message : "Unknown database error",
	);
}
