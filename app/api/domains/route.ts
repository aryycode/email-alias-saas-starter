import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { domains } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

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

        // Get all domains for the current user
        const userDomains = await db.select()
            .from(domains)
            .where(eq(domains.userId, user.id))
            .orderBy(domains.createdAt);

        return NextResponse.json({
            domains: userDomains
        });

    } catch (error) {
        console.error('Error fetching domains:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { domainName } = body;

        if (!domainName || typeof domainName !== 'string') {
            return NextResponse.json(
                { error: 'Domain name is required' },
                { status: 400 }
            );
        }

        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
        if (!domainRegex.test(domainName)) {
            return NextResponse.json(
                { error: 'Invalid domain format' },
                { status: 400 }
            );
        }

        // Check if domain already exists
        const existingDomain = await db.select()
            .from(domains)
            .where(eq(domains.domainName, domainName.toLowerCase()))
            .limit(1);

        if (existingDomain.length > 0) {
            return NextResponse.json(
                { error: 'Domain already exists' },
                { status: 409 }
            );
        }

        // Generate verification code
        const verificationCode = randomUUID();

        // Create new domain
        const [newDomain] = await db.insert(domains)
            .values({
                userId: user.id,
                domainName: domainName.toLowerCase(),
                isVerified: false,
                verificationCode,
                createdAt: new Date(),
            })
            .returning();

        return NextResponse.json({
            domain: newDomain,
            verificationCode,
            instructions: {
                mx: {
                    host: 'mx.cloudflare.net',
                    priority: 10,
                    record: 'MX'
                },
                txt: {
                    name: domainName.toLowerCase(),
                    value: verificationCode,
                    record: 'TXT'
                }
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating domain:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}