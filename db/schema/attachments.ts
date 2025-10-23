import { pgTable, text, integer, uuid } from "drizzle-orm/pg-core";
import { emails } from "./emails";

export const attachments = pgTable("attachments", {
    id: uuid("id").primaryKey().defaultRandom(),
    emailId: uuid("email_id")
        .notNull()
        .references(() => emails.id, { onDelete: "cascade" }),
    filename: text("filename"),
    contentType: text("content_type"),
    sizeBytes: integer("size_bytes"),
    storagePath: text("storage_path").notNull(),
});

export type AttachmentSelect = typeof attachments.$inferSelect;
export type AttachmentInsert = typeof attachments.$inferInsert;