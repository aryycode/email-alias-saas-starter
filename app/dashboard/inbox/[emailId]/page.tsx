'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Download, Paperclip } from 'lucide-react';
import Link from 'next/link';

interface Email {
    id: string;
    fromAddress: string;
    subject: string;
    bodyText?: string;
    bodyHtml?: string;
    isRead: boolean;
    receivedAt: string;
    attachments: Attachment[];
}

interface Attachment {
    id: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    storagePath: string;
}

export default function EmailPage() {
    const params = useParams();
    const router = useRouter();
    const emailId = params.emailId as string;

    const [email, setEmail] = useState<Email | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (emailId) {
            fetchEmail();
        }
    }, [emailId]);

    const fetchEmail = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/emails/${emailId}`);
            if (response.ok) {
                const data = await response.json();
                setEmail(data.email);
            } else if (response.status === 404) {
                toast.error('Email not found');
                router.push('/dashboard/inbox');
            } else {
                toast.error('Failed to fetch email');
            }
        } catch (error) {
            console.error('Error fetching email:', error);
            toast.error('Error fetching email');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmail = async () => {
        if (!confirm('Are you sure you want to delete this email?')) {
            return;
        }

        try {
            const response = await fetch(`/api/emails/${emailId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Email deleted successfully');
                router.push('/dashboard/inbox');
            } else {
                toast.error('Failed to delete email');
            }
        } catch (error) {
            console.error('Error deleting email:', error);
            toast.error('Error deleting email');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="@container/main flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-muted-foreground">Loading email...</div>
                </div>
            </div>
        );
    }

    if (!email) {
        return (
            <div className="@container/main flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">Email not found</h3>
                        <Link href="/dashboard/inbox">
                            <Button variant="outline">Back to Inbox</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/inbox">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Inbox
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">Email Details</h1>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteEmail}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl break-words mb-2">
                                {email.subject || '(No Subject)'}
                            </CardTitle>
                            <CardDescription>
                                <div className="space-y-1">
                                    <div><strong>From:</strong> {email.fromAddress}</div>
                                    <div><strong>Date:</strong> {new Date(email.receivedAt).toLocaleString()}</div>
                                    {email.isRead && (
                                        <div>
                                            <Badge variant="secondary">Read</Badge>
                                        </div>
                                    )}
                                </div>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Attachments */}
                    {email.attachments && email.attachments.length > 0 && (
                        <div className="border rounded-lg p-4 bg-muted/30">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                Attachments ({email.attachments.length})
                            </h4>
                            <div className="space-y-2">
                                {email.attachments.map((attachment) => (
                                    <div
                                        key={attachment.id}
                                        className="flex items-center justify-between p-2 bg-background rounded border"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm truncate">{attachment.filename}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {formatFileSize(attachment.sizeBytes)}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // TODO: Implement attachment download
                                                    toast.info('Attachment download not implemented yet');
                                                }}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Email Body */}
                    <div className="border rounded-lg overflow-hidden">
                        {email.bodyHtml ? (
                            // Use iframe for secure HTML rendering
                            <iframe
                                srcDoc={email.bodyHtml}
                                sandbox="allow-same-origin"
                                className="w-full h-[600px] border-0"
                                title="Email Content"
                            />
                        ) : email.bodyText ? (
                            <div className="p-6">
                                <pre className="whitespace-pre-wrap text-sm font-mono">
                                    {email.bodyText}
                                </pre>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-muted-foreground">
                                No content available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}