'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, ExternalLink, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Domain {
    id: string;
    domainName: string;
    isVerified: boolean;
    verificationCode: string;
    createdAt: string;
}

interface DomainInstructions {
    mx: {
        host: string;
        priority: number;
        record: string;
    };
    txt: {
        name: string;
        value: string;
        record: string;
    };
}

export default function DomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingDomain, setAddingDomain] = useState(false);
    const [newDomainName, setNewDomainName] = useState('');
    const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
    const [instructions, setInstructions] = useState<{ [key: string]: DomainInstructions }>({});
    const [deletingDomain, setDeletingDomain] = useState<string | null>(null);

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const response = await fetch('/api/domains');
            if (response.ok) {
                const data = await response.json();
                setDomains(data.domains || []);
            } else {
                toast.error('Failed to fetch domains');
            }
        } catch (error) {
            console.error('Error fetching domains:', error);
            toast.error('Error fetching domains');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newDomainName.trim()) {
            toast.error('Please enter a domain name');
            return;
        }

        setAddingDomain(true);

        try {
            const response = await fetch('/api/domains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domainName: newDomainName.trim().toLowerCase(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setDomains(prev => [...prev, data.domain]);
                setInstructions(prev => ({
                    ...prev,
                    [data.domain.id]: data.instructions
                }));
                setNewDomainName('');
                toast.success('Domain added successfully! Please configure your DNS records.');
            } else {
                toast.error(data.error || 'Failed to add domain');
            }
        } catch (error) {
            console.error('Error adding domain:', error);
            toast.error('Error adding domain');
        } finally {
            setAddingDomain(false);
        }
    };

    const handleVerifyDomain = async (domainId: string) => {
        setVerifyingDomain(domainId);

        try {
            const response = await fetch(`/api/domains/${domainId}/verify`, {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setDomains(prev => prev.map(domain =>
                    domain.id === domainId
                        ? { ...domain, isVerified: true }
                        : domain
                ));
                toast.success('Domain verified successfully!');
            } else {
                toast.error(data.message || 'Domain verification failed');
            }
        } catch (error) {
            console.error('Error verifying domain:', error);
            toast.error('Error verifying domain');
        } finally {
            setVerifyingDomain(null);
        }
    };

    const handleDeleteDomain = async (domainId: string) => {
        if (!confirm('Are you sure you want to delete this domain? This will also delete all aliases associated with it.')) {
            return;
        }

        setDeletingDomain(domainId);

        try {
            const response = await fetch(`/api/domains/${domainId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                setDomains(prev => prev.filter(domain => domain.id !== domainId));
                setInstructions(prev => {
                    const newInstructions = { ...prev };
                    delete newInstructions[domainId];
                    return newInstructions;
                });
                toast.success('Domain deleted successfully');
            } else {
                toast.error(data.error || 'Failed to delete domain');
            }
        } catch (error) {
            console.error('Error deleting domain:', error);
            toast.error('Error deleting domain');
        } finally {
            setDeletingDomain(null);
        }
    };

    const getStatusBadge = (domain: Domain) => {
        if (domain.isVerified) {
            return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
        } else {
            return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-muted-foreground">Loading domains...</div>
            </div>
        );
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Domain Management</h1>
                    <p className="text-muted-foreground">Manage your custom domains for email aliases</p>
                </div>
            </div>

            {/* Add Domain Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Domain</CardTitle>
                    <CardDescription>
                        Add a custom domain to create email aliases. You'll need to configure DNS records to verify ownership.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddDomain} className="flex gap-4">
                        <Input
                            type="text"
                            placeholder="example.com"
                            value={newDomainName}
                            onChange={(e) => setNewDomainName(e.target.value)}
                            className="flex-1"
                            disabled={addingDomain}
                        />
                        <Button type="submit" disabled={addingDomain || !newDomainName.trim()}>
                            {addingDomain ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" />Add Domain</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Domains List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Domains</CardTitle>
                    <CardDescription>
                        Manage your custom domains and their verification status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {domains.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No domains added yet</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Add your first domain to start creating email aliases
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Domain</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Added</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {domains.map((domain) => (
                                        <TableRow key={domain.id}>
                                            <TableCell className="font-medium">
                                                {domain.domainName}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(domain)}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(domain.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {!domain.isVerified && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleVerifyDomain(domain.id)}
                                                            disabled={verifyingDomain === domain.id}
                                                        >
                                                            {verifyingDomain === domain.id ? 'Verifying...' : 'Verify'}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteDomain(domain.id)}
                                                        disabled={deletingDomain === domain.id}
                                                    >
                                                        {deletingDomain === domain.id ? 'Deleting...' : <Trash2 className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* DNS Instructions for unverified domains */}
                            {domains.filter(d => !d.isVerified).map((domain) => {
                                const domainInstructions = instructions[domain.id];
                                if (!domainInstructions) return null;

                                return (
                                    <Card key={`instructions-${domain.id}`} className="bg-blue-50 border-blue-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg">DNS Configuration for {domain.domainName}</CardTitle>
                                            <CardDescription>
                                                Configure these DNS records to verify your domain ownership
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">MX Record</h4>
                                                <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm">
                                                    Type: MX<br />
                                                    Host: @{domainInstructions.mx.host ? ` (${domainInstructions.mx.host})` : ''}<br />
                                                    Priority: {domainInstructions.mx.priority}<br />
                                                    Value: {domainInstructions.mx.host}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">TXT Record (for verification)</h4>
                                                <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm break-all">
                                                    Type: TXT<br />
                                                    Host: {domainInstructions.txt.name}<br />
                                                    Value: {domainInstructions.txt.value}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                                <ExternalLink className="w-4 h-4" />
                                                <span>Note: DNS changes may take up to 24 hours to propagate</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}