import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { domains } from '@/db/schema';
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { domainId: string } }
) {
    try {
        const user = await getSessionUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const domainId = params.domainId;

        // Delete the domain (will fail if user doesn't own it due to our WHERE clause)
        const deletedDomain = await db.delete(domains)
            .where(and(
                eq(domains.id, domainId),
                eq(domains.userId, user.id)
            ))
            .returning();

        if (deletedDomain.length === 0) {
            return NextResponse.json(
                { error: 'Domain not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Domain deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting domain:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}