import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { emails, attachments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper function to validate session and get user
async function getSessionUser(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || !session.user) {
            return null;
        }

        return session.user;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { emailId: string } }
) {
    try {
        const user = await getSessionUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const emailId = params.emailId;

        // Get the email with attachments, ensuring user owns it
        const emailResult = await db.select({
            id: emails.id,
            fromAddress: emails.fromAddress,
            subject: emails.subject,
            bodyText: emails.bodyText,
            bodyHtml: emails.bodyHtml,
            isRead: emails.isRead,
            receivedAt: emails.receivedAt,
        })
            .from(emails)
            .where(and(
                eq(emails.id, emailId),
                eq(emails.userId, user.id)
            ))
            .limit(1);

        if (emailResult.length === 0) {
            return NextResponse.json(
                { error: 'Email not found' },
                { status: 404 }
            );
        }

        const email = emailResult[0];

        // Get attachments for this email
        const emailAttachments = await db.select({
            id: attachments.id,
            filename: attachments.filename,
            contentType: attachments.contentType,
            sizeBytes: attachments.sizeBytes,
            storagePath: attachments.storagePath,
        })
            .from(attachments)
            .where(eq(attachments.emailId, emailId));

        // Mark email as read if it wasn't already
        if (!email.isRead) {
            await db.update(emails)
                .set({ isRead: true })
                .where(and(
                    eq(emails.id, emailId),
                    eq(emails.userId, user.id)
                ));
        }

        return NextResponse.json({
            email: {
                ...email,
                isRead: true, // Always return as true since we just marked it
            },
            attachments: emailAttachments,
        });

    } catch (error) {
        console.error('Error fetching email:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { emailId: string } }
) {
    try {
        const user = await getSessionUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const emailId = params.emailId;

        // Delete the email (will fail if user doesn't own it due to our WHERE clause)
        // Note: This will also delete attachments due to CASCADE delete
        const deletedEmail = await db.delete(emails)
            .where(and(
                eq(emails.id, emailId),
                eq(emails.userId, user.id)
            ))
            .returning();

        if (deletedEmail.length === 0) {
            return NextResponse.json(
                { error: 'Email not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Email deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting email:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}