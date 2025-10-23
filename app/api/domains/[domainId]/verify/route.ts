import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { domains } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { promises as dns } from 'dns';

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

export async function POST(
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

        // Find the domain and verify user ownership
        const domain = await db.select()
            .from(domains)
            .where(and(
                eq(domains.id, domainId),
                eq(domains.userId, user.id)
            ))
            .limit(1);

        if (domain.length === 0) {
            return NextResponse.json(
                { error: 'Domain not found' },
                { status: 404 }
            );
        }

        const domainRecord = domain[0];

        // If already verified, return success
        if (domainRecord.isVerified) {
            return NextResponse.json({
                message: 'Domain is already verified',
                domain: domainRecord
            });
        }

        // Perform DNS TXT record lookup
        try {
            const txtRecords = await dns.resolveTxt(domainRecord.domainName);

            // Flatten the records (resolveTxt returns array of arrays)
            const allTxtRecords = txtRecords.flat();

            // Check if verification code exists in TXT records
            const isVerified = allTxtRecords.some(record =>
                record.includes(domainRecord.verificationCode)
            );

            if (isVerified) {
                // Update domain verification status
                const [updatedDomain] = await db.update(domains)
                    .set({ isVerified: true })
                    .where(and(
                        eq(domains.id, domainId),
                        eq(domains.userId, user.id)
                    ))
                    .returning();

                return NextResponse.json({
                    message: 'Domain verified successfully',
                    domain: updatedDomain
                });
            } else {
                return NextResponse.json({
                    message: 'Verification failed. TXT record not found or does not match.',
                    expectedValue: domainRecord.verificationCode,
                    foundRecords: allTxtRecords
                }, { status: 400 });
            }

        } catch (dnsError) {
            console.error('DNS lookup error:', dnsError);

            // Check if it's a NXDOMAIN (domain doesn't exist) error
            if (dnsError instanceof Error && dnsError.message.includes('ENOTFOUND')) {
                return NextResponse.json({
                    message: 'Domain does not exist or is not configured correctly',
                    error: 'Domain not found in DNS'
                }, { status: 400 });
            }

            return NextResponse.json({
                message: 'Failed to verify domain DNS records',
                error: 'DNS lookup failed'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error verifying domain:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}