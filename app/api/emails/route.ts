import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { emails } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

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

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse query parameters for pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Get emails for the current user with pagination
        const userEmails = await db.select({
            id: emails.id,
            fromAddress: emails.fromAddress,
            subject: emails.subject,
            isRead: emails.isRead,
            receivedAt: emails.receivedAt,
            hasBodyHtml: emails.bodyHtml,
        })
            .from(emails)
            .where(eq(emails.userId, user.id))
            .orderBy(desc(emails.receivedAt))
            .limit(limit)
            .offset(offset);

        // Get total count for pagination info
        const totalCountResult = await db.select({ count: emails.id })
            .from(emails)
            .where(eq(emails.userId, user.id));

        const totalCount = totalCountResult.length;

        return NextResponse.json({
            emails: userEmails,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }
        });

    } catch (error) {
        console.error('Error fetching emails:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}