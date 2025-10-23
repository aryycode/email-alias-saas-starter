import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { domains } from "./domains";

export const aliases = pgTable("aliases", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    domainId: uuid("domain_id")
        .references(() => domains.id, { onDelete: "set null" }),
    aliasEmail: text("alias_email").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
});

export type AliasSelect = typeof aliases.$inferSelect;
export type AliasInsert = typeof aliases.$inferInsert;