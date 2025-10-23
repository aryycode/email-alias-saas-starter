import { NextRequest, NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';
import { db } from '@/db';
import { aliases, domains, emails, attachments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Helper function to find user by email address
async function findUserByRecipient(emailAddress: string): Promise<{ userId: string, aliasId?: string } | null> {
    // First, try to find exact match in aliases table
    const alias = await db.select()
        .from(aliases)
        .where(eq(aliases.aliasEmail, emailAddress))
        .limit(1);

    if (alias.length > 0) {
        return {
            userId: alias[0].userId,
            aliasId: alias[0].id
        };
    }

    // If not found in aliases, check for catch-all domain
    const domainMatch = emailAddress.match(/@(.+)$/);
    if (domainMatch) {
        const domainName = domainMatch[1];

        const domain = await db.select()
            .from(domains)
            .where(and(
                eq(domains.domainName, domainName),
                eq(domains.isVerified, true)
            ))
            .limit(1);

        if (domain.length > 0) {
            return {
                userId: domain[0].userId
            };
        }
    }

    return null;
}

// Helper function to upload attachment to storage (placeholder for actual implementation)
async function uploadAttachment(content: Buffer, filename: string, contentType: string): Promise<string> {
    // TODO: Implement actual storage upload to R2, S3, or GCS
    // For now, return a placeholder path
    const storagePath = `attachments/${randomUUID()}/${filename}`;

    // In a real implementation, you would:
    // 1. Initialize your storage client (AWS S3, Cloudflare R2, etc.)
    // 2. Upload the buffer to storage
    // 3. Return the storage path/URL

    console.log(`Attachment ${filename} (${contentType}) would be uploaded to: ${storagePath}`);

    return storagePath;
}

export async function POST(request: NextRequest) {
    try {
        // Verify the secret key from Authorization header
        const authHeader = request.headers.get('authorization');
        const expectedSecret = process.env.WORKER_SECRET_KEY;

        if (!authHeader || authHeader !== expectedSecret) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get recipient email from header
        const recipientEmail = request.headers.get('X-Email-To');
        if (!recipientEmail) {
            return NextResponse.json(
                { error: 'Missing recipient email' },
                { status: 400 }
            );
        }

        // Get raw email data from request body
        const rawEmail = await request.text();
        if (!rawEmail) {
            return NextResponse.json(
                { error: 'Missing email data' },
                { status: 400 }
            );
        }

        // Find the user by recipient email
        const recipient = await findUserByRecipient(recipientEmail);
        if (!recipient) {
            return NextResponse.json(
                { error: 'Recipient not found' },
                { status: 404 }
            );
        }

        // Parse the raw email
        const parsedEmail = await simpleParser(rawEmail);

        // Extract email data
        const fromAddress = parsedEmail.from?.text || '';
        const subject = parsedEmail.subject || '(No Subject)';
        const bodyText = parsedEmail.text || '';
        const bodyHtml = parsedEmail.html || '';
        const attachmentsList = parsedEmail.attachments || [];

        // Insert email into database
        const [newEmail] = await db.insert(emails)
            .values({
                userId: recipient.userId,
                aliasId: recipient.aliasId,
                fromAddress,
                subject,
                bodyText,
                bodyHtml,
                isRead: false,
                receivedAt: new Date(),
            })
            .returning();

        // Handle attachments if any
        if (attachmentsList.length > 0) {
            const attachmentRecords = [];

            for (const attachment of attachmentsList) {
                if (attachment.content && attachment.filename) {
                    // Upload attachment to storage
                    const storagePath = await uploadAttachment(
                        Buffer.from(attachment.content),
                        attachment.filename,
                        attachment.contentType || 'application/octet-stream'
                    );

                    // Create attachment record
                    attachmentRecords.push({
                        emailId: newEmail.id,
                        filename: attachment.filename,
                        contentType: attachment.contentType,
                        sizeBytes: attachment.size || 0,
                        storagePath,
                    });
                }
            }

            // Insert all attachment records
            if (attachmentRecords.length > 0) {
                await db.insert(attachments)
                    .values(attachmentRecords);
            }
        }

        return NextResponse.json(
            {
                success: true,
                messageId: newEmail.id,
                recipient: recipientEmail
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error processing inbound email:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}