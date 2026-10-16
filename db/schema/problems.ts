import { integer, pgEnum, varchar, text } from "drizzle-orm/pg-core/columns";
import { pgTable } from "drizzle-orm/pg-core/table";
import { snakeCase } from "drizzle-orm/pg-core";

export const testTable = pgTable("test", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
});

export const difficulty = pgEnum("difficulty", ["Easy", "Medium", "Hard"]);

export const problemsTable = snakeCase.table("problems", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  lcID: integer().unique().notNull(),
  title: varchar({ length: 255 }).notNull(),
  titleSlug: varchar({ length: 255 }).notNull(),
  url: text().unique(),
  topics: text().array(),
  difficulty: difficulty().notNull(),
});
