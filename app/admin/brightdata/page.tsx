'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface QuotaInfo {
  remaining: number;
  total: number;
  used: number;
  reset_date?: string;
}

export default function BrightDataAdminPage() {
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [testUrl, setTestUrl] = useState('https://www.facebook.com/marketplace/item/1234567890/');
  const [testResults, setTestResults] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch configuration on page load
  useEffect(() => {
    fetchConfig();
  }, []);

  // Fetch Bright Data configuration
  const fetchConfig = async () => {
    try {
      setConfigLoading(true);
      setError(null);

      const response = await fetch('/api/v1/brightdata');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch Bright Data configuration');
      }

      const data = await response.json();

      if (data.data.quota) {
        setQuotaInfo(data.data.quota);
      }

      setConfigLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setConfigLoading(false);
    }
  };

  // Check zone configuration
  const checkZoneConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/brightdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check Bright Data zone configuration');
      }

      const data = await response.json();

      toast.success('Bright Data zone configuration checked successfully');
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to check Bright Data zone configuration');
      setLoading(false);
    }
  };

  // Test URL with Bright Data API
  const handleTestUrl = async () => {
    try {
      setTestLoading(true);
      setError(null);
      setTestResults(null);

      const response = await fetch('/api/v1/brightdata/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to test URL with Bright Data API');
      }

      const data = await response.json();

      setTestResults(data.data);
      toast.success('URL tested successfully with Bright Data API');
      setTestLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to test URL with Bright Data API');
      setTestLoading(false);
    }
  };

  // Get account information
  const getAccountInfo = async () => {
    try {
      setQuotaLoading(true);
      setError(null);

      const response = await fetch('/api/v1/brightdata');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get Bright Data account information');
      }

      const data = await response.json();

      if (data.data.accountInfo && data.data.accountInfo.quota) {
        setQuotaInfo(data.data.accountInfo.quota);
      }
      toast.success('Account information retrieved successfully');
      setQuotaLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to get account information');
      setQuotaLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Bright Data MCP Administration</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="preset" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preset">Zone Configuration</TabsTrigger>
          <TabsTrigger value="proxy">Proxy Details</TabsTrigger>
          <TabsTrigger value="test">Test Preset</TabsTrigger>
          <TabsTrigger value="quota">Quota Information</TabsTrigger>
        </TabsList>

        <TabsContent value="preset">
          <Card>
            <CardHeader>
              <CardTitle>Bright Data Zone Configuration</CardTitle>
              <CardDescription>
                Configure and manage the Bright Data zone for Facebook Marketplace scraping.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Zone Name</Label>
                    <Input value="mcp_unlocker" disabled />
                  </div>
                  <div>
                    <Label>API Key</Label>
                    <Input value="9ef6d96c-2ecd-4614-a549-354bf25687ab" type="password" disabled />
                  </div>
                </div>

                <div>
                  <Label>Target URLs</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>facebook.com/marketplace/*</Badge>
                    <Badge>facebook.com/marketplace/item/*</Badge>
                    <Badge>facebook.com/marketplace/category/*</Badge>
                    <Badge>facebook.com/marketplace/search/*</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Rate Limiting</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Requests Per Minute</Label>
                      <Input value="10" disabled />
                    </div>
                    <div>
                      <Label>Min Delay (ms)</Label>
                      <Input value="2000" disabled />
                    </div>
                    <div>
                      <Label>Max Delay (ms)</Label>
                      <Input value="5000" disabled />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={checkZoneConfiguration} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Zone...
                  </>
                ) : (
                  'Check Zone Configuration'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="proxy">
          <Card>
            <CardHeader>
              <CardTitle>Bright Data Proxy Configuration</CardTitle>
              <CardDescription>
                Connection details for direct proxy access to Bright Data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Host</Label>
                    <Input value="brd.superproxy.io" disabled />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input value="33325" disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input value="brd-customer-hl_fo7ed603-zone-mcp_unlocker" disabled />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input value="c9sfk6u49o4w" type="password" disabled />
                  </div>
                </div>

                <div>
                  <Label>Zone Name</Label>
                  <Input value="mcp_unlocker" disabled />
                </div>

                <Separator />

                <div>
                  <Label>Proxy URL</Label>
                  <div className="relative mt-1">
                    <Input
                      value="http://brd-customer-hl_fo7ed603-zone-mcp_unlocker:c9sfk6u49o4w@brd.superproxy.io:33325"
                      disabled
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => {
                        navigator.clipboard.writeText("http://brd-customer-hl_fo7ed603-zone-mcp_unlocker:c9sfk6u49o4w@brd.superproxy.io:33325");
                        toast.success("Proxy URL copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Example cURL Command</Label>
                  <div className="bg-muted p-3 rounded-md mt-1 overflow-x-auto text-sm">
                    <code>curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer 9ef6d96c-2ecd-4614-a549-354bf25687ab" -d '&#123;"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":&#123;"json":true&#125;&#125;'</code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      navigator.clipboard.writeText('curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer 9ef6d96c-2ecd-4614-a549-354bf25687ab" -d \'{"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":{"json":true}}\'');
                      toast.success("cURL command copied to clipboard");
                    }}
                  >
                    Copy Command
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test URL with Bright Data API</CardTitle>
              <CardDescription>
                Test the Bright Data API with a sample Facebook Marketplace URL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-url">Facebook Marketplace URL</Label>
                  <Input
                    id="test-url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://www.facebook.com/marketplace/item/123456789/"
                  />
                </div>

                {testResults && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Test Results</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleTestUrl} disabled={testLoading}>
                {testLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test URL'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="quota">
          <Card>
            <CardHeader>
              <CardTitle>Bright Data Account Information</CardTitle>
              <CardDescription>
                View your current account information and quota limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotaInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Total Quota</Label>
                      <div className="text-2xl font-bold mt-1">{quotaInfo.total}</div>
                    </div>
                    <div>
                      <Label>Used</Label>
                      <div className="text-2xl font-bold mt-1">{quotaInfo.used}</div>
                    </div>
                    <div>
                      <Label>Remaining</Label>
                      <div className="text-2xl font-bold mt-1">{quotaInfo.remaining}</div>
                    </div>
                  </div>

                  {quotaInfo.reset_date && (
                    <div>
                      <Label>Reset Date</Label>
                      <div className="text-lg mt-1">
                        {new Date(quotaInfo.reset_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No quota information available.</p>
                  <p className="text-muted-foreground">Click the button below to check your quota.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={getAccountInfo} disabled={quotaLoading}>
                {quotaLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Account Info...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Account Information
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
