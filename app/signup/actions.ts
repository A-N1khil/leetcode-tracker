"use server";

import { testTable } from "@/db/schema";
import { db } from "@/index";

export async function fetchTestRows() {
  return db.select().from(testTable);
}
