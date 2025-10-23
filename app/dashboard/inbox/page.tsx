'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Search, Mail, MailOpen, Trash2, Download, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Email {
    id: string;
    fromAddress: string;
    subject: string;
    isRead: boolean;
    receivedAt: string;
    hasBodyHtml?: boolean;
}

interface Attachment {
    id: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    storagePath: string;
}

interface FullEmail extends Email {
    bodyText?: string;
    bodyHtml?: string;
    attachments: Attachment[];
}

export default function InboxPage() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<FullEmail | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    useEffect(() => {
        fetchEmails();
    }, [currentPage, searchQuery]);

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '50',
            });

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const response = await fetch(`/api/emails?${params}`);
            if (response.ok) {
                const data = await response.json();
                setEmails(data.emails || []);
                setTotalPages(data.pagination?.totalPages || 1);
            } else {
                toast.error('Failed to fetch emails');
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            toast.error('Error fetching emails');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmail = async (emailId: string) => {
        if (selectedEmail?.id === emailId) {
            return; // Already selected
        }

        setLoadingEmail(emailId);

        try {
            const response = await fetch(`/api/emails/${emailId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedEmail(data.email);

                // Update the email in the list to mark as read
                setEmails(prev => prev.map(email =>
                    email.id === emailId ? { ...email, isRead: true } : email
                ));

                // Update URL to include email ID
                router.push(`/dashboard/inbox/${emailId}`, { scroll: false });
            } else {
                toast.error('Failed to fetch email');
            }
        } catch (error) {
            console.error('Error fetching email:', error);
            toast.error('Error fetching email');
        } finally {
            setLoadingEmail(null);
        }
    };

    const handleDeleteEmail = async (emailId: string) => {
        if (!confirm('Are you sure you want to delete this email?')) {
            return;
        }

        try {
            const response = await fetch(`/api/emails/${emailId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setEmails(prev => prev.filter(email => email.id !== emailId));
                if (selectedEmail?.id === emailId) {
                    setSelectedEmail(null);
                    router.push('/dashboard/inbox', { scroll: false });
                }
                toast.success('Email deleted successfully');
            } else {
                toast.error('Failed to delete email');
            }
        } catch (error) {
            console.error('Error deleting email:', error);
            toast.error('Error deleting email');
        }
    };

    const formatAddress = (address: string) => {
        const emailRegex = /^(.+?)\s*<(.+?)>$/;
        const match = address.match(emailRegex);
        if (match) {
            return { name: match[1].trim(), email: match[2] };
        }
        return { name: address, email: address };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Inbox</h1>
                    <p className="text-muted-foreground">Your email messages</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search emails..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 w-64"
                        />
                    </div>
                </div>
            </div>

            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Email List Panel */}
                <ResizablePanel defaultSize={40} minSize={20}>
                    <Card className="h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Messages</CardTitle>
                            <CardDescription>
                                {emails.filter(e => !e.isRead).length} unread messages
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[calc(100%-8rem)]">
                                {loading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="text-sm text-muted-foreground">Loading emails...</div>
                                    </div>
                                ) : emails.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No emails found</p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Your incoming emails will appear here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {emails.map((email) => {
                                            const { name: senderName } = formatAddress(email.fromAddress);
                                            return (
                                                <div
                                                    key={email.id}
                                                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedEmail?.id === email.id ? 'bg-muted' : ''}`}
                                                    onClick={() => handleSelectEmail(email.id)}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`font-medium truncate ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                    {senderName}
                                                                </span>
                                                                {!email.isRead && (
                                                                    <Badge variant="secondary" className="text-xs">New</Badge>
                                                                )}
                                                            </div>
                                                            <div className={`text-sm truncate mb-1 ${!email.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                                                                {email.subject || '(No Subject)'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatDate(email.receivedAt)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {email.isRead ? (
                                                                <MailOpen className="w-4 h-4 text-muted-foreground" />
                                                            ) : (
                                                                <Mail className="w-4 h-4 text-blue-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Email Detail Panel */}
                <ResizablePanel defaultSize={60} minSize={30}>
                    <Card className="h-full">
                        {selectedEmail ? (
                            <>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-xl break-words">
                                                {selectedEmail.subject || '(No Subject)'}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                From: {selectedEmail.fromAddress}
                                            </CardDescription>
                                            <CardDescription>
                                                {new Date(selectedEmail.receivedAt).toLocaleString()}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteEmail(selectedEmail.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {loadingEmail === selectedEmail.id ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="text-sm text-muted-foreground">Loading email...</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Attachments */}
                                            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                                                <div className="border rounded-lg p-4 bg-muted/30">
                                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                        <Paperclip className="w-4 h-4" />
                                                        Attachments ({selectedEmail.attachments.length})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {selectedEmail.attachments.map((attachment) => (
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
                                                {selectedEmail.bodyHtml ? (
                                                    // Use iframe for secure HTML rendering
                                                    <iframe
                                                        srcDoc={selectedEmail.bodyHtml}
                                                        sandbox="allow-same-origin"
                                                        className="w-full h-[500px] border-0"
                                                        title="Email Content"
                                                    />
                                                ) : selectedEmail.bodyText ? (
                                                    <div className="p-6">
                                                        <pre className="whitespace-pre-wrap text-sm font-mono">
                                                            {selectedEmail.bodyText}
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 text-center text-muted-foreground">
                                                        No content available
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Select an email</h3>
                                    <p className="text-muted-foreground">
                                        Choose an email from the list to view its contents
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}