import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { aliases } from "./aliases";

export const emails = pgTable("emails", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    aliasId: uuid("alias_id")
        .references(() => aliases.id, { onDelete: "set null" }),
    fromAddress: text("from_address").notNull(),
    subject: text("subject"),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),
    isRead: boolean("is_read").default(false).notNull(),
    receivedAt: timestamp("received_at")
        .defaultNow()
        .notNull(),
});

export type EmailSelect = typeof emails.$inferSelect;
export type EmailInsert = typeof emails.$inferInsert;