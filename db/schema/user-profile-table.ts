import { integer, snakeCase, text, varchar } from "drizzle-orm/pg-core";

export const userProfileTable = snakeCase.table("user_profile", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	email: varchar({ length: 255 }).notNull().unique(),
	username: text().notNull().unique(),
	githubUrl: text(),
	twitterUrl: text(),
	linkedinUrl: text(),
});

export const userProfileMetaSchema = snakeCase.table("user_profile_meta", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	username: text()
		.notNull()
		.unique()
		.references(() => userProfileTable.username),
	userAvatar: text(),
	realName: text(),
	websites: text().array(),
	countryName: text(),
	company: text(),
	jobTitle: text(),
	skillTags: text().array(),
	school: text(),
	aboutMe: text(),
	postViewCount: integer(),
	postViewCountDiff: integer(),
	reputation: integer(),
	ranking: integer(),
	reputationDiff: integer(),
	solutionCount: integer(),
	solutionCountDiff: integer(),
	categoryDiscussCount: integer(),
	categoryDiscussCountDiff: integer(),
	certificationLevel: text(),
});
