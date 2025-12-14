"use server";

import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { UsersTable } from "@/drizzle/schema";

export async function getUser(userId: string) {

   return db.query.UsersTable.findFirst({
      where: eq(UsersTable.id, userId),
   });
}