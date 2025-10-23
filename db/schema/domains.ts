import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const domains = pgTable("domains", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    domainName: text("domain_name").notNull().unique(),
    isVerified: boolean("is_verified").default(false).notNull(),
    verificationCode: text("verification_code").notNull().unique(),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
});

export type DomainSelect = typeof domains.$inferSelect;
export type DomainInsert = typeof domains.$inferInsert;