import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ siteName: string }>;
}) {
  const { siteName } = await params;
  const decodedSiteName = decodeURIComponent(siteName);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const { data: website } = await supabase
    .from("websites")
    .select("*")
    .eq("name", decodedSiteName)
    .single();

  let statusChecks;
  let isDemo = false;
  let websiteInfo;

  if (!website) {
    // This is a demo site, create mock data
    isDemo = true;
    websiteInfo = {
      name: decodedSiteName,
      url: `https://${decodedSiteName}`,
    };
    
    // Generate mock status checks for the last 7 days
    const mockChecks = [];
    const now = new Date();
    
    for (let i = 0; i < 168; i++) { // 7 days * 24 hours
      const checkTime = new Date(now.getTime() - i * 60 * 60 * 1000); // Every hour
      const baseResponseTime = 150 + Math.sin((checkTime.getHours() / 24) * Math.PI * 2) * 50;
      let responseTime = Math.round(baseResponseTime + Math.random() * 80);
      
      let statusCode = 200;
      const random = Math.random();
      if (random > 0.98) {
        statusCode = 0;
        responseTime = 0;
      } else if (random > 0.95) {
        statusCode = 500 + Math.floor(Math.random() * 4);
      } else if (random > 0.9) {
        statusCode = 400 + Math.floor(Math.random() * 5);
      }
      
      mockChecks.push({
        id: `mock-${i}`,
        checked_at: checkTime.toISOString(),
        status_code: statusCode,
        response_time: responseTime,
      });
    }
    
    statusChecks = mockChecks;
  } else {
    websiteInfo = website;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: realStatusChecks } = await supabase
      .from("status_checks")
      .select("*")
      .eq("website_id", website.id)
      .gte("checked_at", sevenDaysAgo.toISOString())
      .order("checked_at", { ascending: false });
    
    statusChecks = realStatusChecks;
  }

  const getStatusText = (statusCode: number) => {
    if (statusCode === 0) return "Timeout";
    if (statusCode >= 500) return "Server Error";
    if (statusCode >= 400) return "Client Error";
    if (statusCode >= 300) return "Redirect";
    if (statusCode >= 200) return "Online";
    return "Unknown";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/site/${encodeURIComponent(decodedSiteName)}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Status Report - {websiteInfo.name}</h1>
              {isDemo && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Demo Data
                </span>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>7-Day Status Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Checked At</th>
                      <th className="text-left p-2 font-medium">Status Code</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Response Time (ms)</th>
                      <th className="text-left p-2 font-medium">Website Name</th>
                      <th className="text-left p-2 font-medium">Website URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusChecks?.map((check) => (
                      <tr key={check.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          {new Date(check.checked_at).toLocaleString()}
                        </td>
                        <td className="p-2">{check.status_code}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            check.status_code === 0 ? 'bg-gray-100 text-gray-800' :
                            check.status_code >= 500 ? 'bg-red-100 text-red-800' :
                            check.status_code >= 400 ? 'bg-yellow-100 text-yellow-800' :
                            check.status_code >= 300 ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {getStatusText(check.status_code)}
                          </span>
                        </td>
                        <td className="p-2">{check.response_time || 0}</td>
                        <td className="p-2">{websiteInfo.name}</td>
                        <td className="p-2 text-blue-600 hover:underline">
                          <a href={websiteInfo.url} target="_blank" rel="noopener noreferrer">
                            {websiteInfo.url}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!statusChecks?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No status checks found for the last 7 days
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 