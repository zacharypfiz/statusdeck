"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Link from "next/link";
import { ArrowLeft, Settings, Filter } from "lucide-react";
import StatCard from "@/components/stat-card";
import {
  CustomDot,
  CustomTooltipContent,
  chartConfig,
} from "@/components/shared-chart-components";
import { generateChartData } from "@/lib/mock-data";
import PerformanceAnalysis from "@/components/performance-analysis";
import { cn } from "@/lib/utils";

const statusFilters = [
  { label: "All", value: "all", color: "bg-gray-400" },
  { label: "Online (200-299)", value: "success", color: "bg-green-500" },
  { label: "Redirect (300-399)", value: "redirect", color: "bg-blue-500" },
  { label: "Client Error (400-499)", value: "client-error", color: "bg-yellow-500" },
  { label: "Server Error (500+)", value: "server-error", color: "bg-red-500" },
  { label: "Timeout (0)", value: "timeout", color: "bg-gray-500" },
];

const getStatusCategory = (status: number) => {
  if (status === 0) return "timeout";
  if (status >= 500) return "server-error";
  if (status >= 400) return "client-error";
  if (status >= 300) return "redirect";
  if (status >= 200) return "success";
  return "all";
};

export default function SiteDashboardPage() {
  const params = useParams<{ siteName: string }>();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("6h");
  const [chartData, setChartData] = useState<{time: string; responseTime: number; status: number}[]>([]);
  const [allChartData, setAllChartData] = useState<{time: string; responseTime: number; status: number}[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [website, setWebsite] = useState<{id?: string; name: string; url: string} | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const siteName = decodeURIComponent(params.siteName);
  const supabase = createClient();

  useEffect(() => {
    const fetchWebsiteData = async () => {
      const { data: websiteData } = await supabase
        .from("websites")
        .select("*")
        .eq("name", siteName)
        .single();

      if (websiteData) {
        setWebsite(websiteData);
        setIsDemo(false);
      } else {
        setWebsite({ name: siteName, url: `https://${siteName}` });
        setIsDemo(true);
      }
    };
    fetchWebsiteData();
  }, [siteName, supabase]);

  useEffect(() => {
    const fetchStatusChecks = async () => {
      if (isDemo) {
        setChartData(generateChartData(timeRange));
        return;
      }

      if (!website) {
        return;
      }

      const now = new Date();
      let startTime = new Date();

      switch (timeRange) {
        case "1h":
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "6h":
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case "24h":
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data: statusChecks } = await supabase
        .from("status_checks")
        .select("*")
        .eq("website_id", website.id!)
        .gte("checked_at", startTime.toISOString())
        .order("checked_at", { ascending: false })
        .limit(1000);

      if (statusChecks && statusChecks.length > 0) {
        const formattedData = statusChecks.reverse().map((check) => ({
          time: check.checked_at,
          responseTime: check.response_time || 0,
          status: check.status_code || 0,
        }));
        setAllChartData(formattedData);
      } else {
        setAllChartData([]);
      }
    };

    fetchStatusChecks();
  }, [website, timeRange, isDemo, supabase]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      if (isDemo) {
        if (statusFilter === "all") {
          setChartData(allChartData);
        } else {
          const filteredData = allChartData.filter((data) => {
            const category = getStatusCategory(data.status);
            return category === statusFilter;
          });
          setChartData(filteredData);
        }
        return;
      }

      if (!website) return;

      if (statusFilter === "all") {
        setChartData(allChartData);
        return;
      }

      // For specific status filters, fetch fresh data with status-specific query
      const now = new Date();
      let startTime = new Date();

      switch (timeRange) {
        case "1h":
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "6h":
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case "24h":
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Build status code filter and query based on category
      let filteredChecks;
      
      switch (statusFilter) {
        case "success":
          ({ data: filteredChecks } = await supabase
            .from("status_checks")
            .select("*")
            .eq("website_id", website.id!)
            .gte("checked_at", startTime.toISOString())
            .gte("status_code", 200)
            .lt("status_code", 300)
            .order("checked_at", { ascending: false })
            .limit(1000));
          break;
        case "redirect":
          ({ data: filteredChecks } = await supabase
            .from("status_checks")
            .select("*")
            .eq("website_id", website.id!)
            .gte("checked_at", startTime.toISOString())
            .gte("status_code", 300)
            .lt("status_code", 400)
            .order("checked_at", { ascending: false })
            .limit(1000));
          break;
        case "client-error":
          ({ data: filteredChecks } = await supabase
            .from("status_checks")
            .select("*")
            .eq("website_id", website.id!)
            .gte("checked_at", startTime.toISOString())
            .gte("status_code", 400)
            .lt("status_code", 500)
            .order("checked_at", { ascending: false })
            .limit(1000));
          break;
        case "server-error":
          ({ data: filteredChecks } = await supabase
            .from("status_checks")
            .select("*")
            .eq("website_id", website.id!)
            .gte("checked_at", startTime.toISOString())
            .gte("status_code", 500)
            .order("checked_at", { ascending: false })
            .limit(1000));
          break;
        case "timeout":
          ({ data: filteredChecks } = await supabase
            .from("status_checks")
            .select("*")
            .eq("website_id", website.id!)
            .gte("checked_at", startTime.toISOString())
            .eq("status_code", 0)
            .order("checked_at", { ascending: false })
            .limit(1000));
          break;
        default:
          filteredChecks = null;
      }

      if (filteredChecks) {

        if (filteredChecks && filteredChecks.length > 0) {
          const formattedData = filteredChecks.reverse().map((check) => ({
            time: check.checked_at,
            responseTime: check.response_time || 0,
            status: check.status_code || 0,
          }));
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      }
    };

    fetchFilteredData();
  }, [allChartData, statusFilter, website, timeRange, isDemo, supabase]);

  const formatTick = (tick: string) => {
    const date = new Date(tick);
    if (timeRange === "7d" || timeRange === "30d") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateStats = () => {
    if (chartData.length === 0) {
      return {
        avgResponseTime: 0,
        uptime: 0,
        totalChecks: 0,
        incidents: 0,
      };
    }

    const responseTimes = chartData
      .map((d) => d.responseTime)
      .filter((rt) => rt > 0);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          )
        : 0;

    const successfulChecks = chartData.filter(
      (d) => d.status >= 200 && d.status < 300
    ).length;
    const uptime = chartData.length > 0 ? (successfulChecks / chartData.length) * 100 : 0;
    const incidents = chartData.length - successfulChecks;

    return {
      avgResponseTime,
      uptime: parseFloat(uptime.toFixed(2)),
      totalChecks: chartData.length,
      incidents,
    };
  };

  const stats = calculateStats();

  const handleUpdateWebsite = async () => {
    if (!website || isDemo) return;
    
    setLoading(true);
    setError("");

    if (!editName.trim() || !editUrl.trim()) {
      setError("Please fill in both fields");
      setLoading(false);
      return;
    }

    try {
      let processedUrl = editUrl.trim();
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl;
      }

          const { error: updateError } = await supabase
      .from("websites")
      .update({
        name: editName.trim(),
        url: processedUrl,
      })
      .eq("id", website.id!);

      if (updateError) {
        setError("Failed to update website. Please try again.");
        console.error("Update error:", updateError);
        return;
      }

      setWebsite({ ...website, name: editName.trim(), url: processedUrl });
      setIsSettingsOpen(false);
      
      if (editName.trim() !== siteName) {
        router.push(`/site/${encodeURIComponent(editName.trim())}`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebsite = async () => {
    if (!website || isDemo) return;
    
    setLoading(true);
    setError("");

    try {
          const { error: deleteError } = await supabase
      .from("websites")
      .delete()
      .eq("id", website.id!);

      if (deleteError) {
        setError("Failed to delete website. Please try again.");
        console.error("Delete error:", deleteError);
        return;
      }

      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    if (website && !isDemo) {
      setEditName(website.name);
      setEditUrl(website.url);
      setError("");
      setIsSettingsOpen(true);
    }
  };

  if (!website) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 rounded-full hover:bg-muted">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h2 className="text-3xl font-bold">{website.name}</h2>
              {!isDemo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openSettings}
                  className="p-2 rounded-full hover:bg-muted"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              {isDemo && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Demo Data
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={(value) => value && setTimeRange(value)}
              >
                <ToggleGroupItem value="1h">1H</ToggleGroupItem>
                <ToggleGroupItem value="6h">6H</ToggleGroupItem>
                <ToggleGroupItem value="24h">24H</ToggleGroupItem>
                <ToggleGroupItem value="7d">7D</ToggleGroupItem>
                <ToggleGroupItem value="30d">30D</ToggleGroupItem>
              </ToggleGroup>
              <Button asChild variant="outline">
                <Link href={`/site/${encodeURIComponent(siteName)}/report`}>
                  Generate Report
                </Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Response Time</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                      {statusFilter !== "all" && (
                        <>
                          <div className="mx-1 h-4 w-px bg-muted-foreground" />
                          <span className="font-semibold text-primary">
                            {
                              statusFilters.find((f) => f.value === statusFilter)
                                ?.label.split(" ")[0]
                            }
                          </span>
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filter by Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      {statusFilters.map((filter) => (
                        <div
                          key={filter.value}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            statusFilter === filter.value
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted"
                          )}
                          onClick={() => setStatusFilter(filter.value)}
                        >
                          <div className={cn("w-3 h-3 rounded-full", filter.color)} />
                          <span className="text-sm font-medium">{filter.label}</span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-96 w-full">
                  <LineChart data={chartData} margin={{ top: 20, right: 25, bottom: 5, left: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval={Math.floor(chartData.length / 12)}
                      tickFormatter={formatTick}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value}ms`}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip content={<CustomTooltipContent />} cursor={false} />
                    <Line
                      dataKey="responseTime"
                      type="natural"
                      stroke="var(--color-responseTime)"
                      strokeWidth={2}
                      dot={<CustomDot />}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-96 w-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    {isDemo ? "Loading chart data..." : "No monitoring data available for this time range"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            <StatCard
              title="Average Response Time"
              value={`${stats.avgResponseTime}ms`}
            />
            <StatCard title="Uptime" value={`${stats.uptime}%`} />
            <StatCard
              title="Total Checks"
              value={stats.totalChecks.toString()}
            />
            <StatCard title="Incidents" value={stats.incidents.toString()} />
          </div>
          
          <PerformanceAnalysis stats={stats} chartData={chartData} />
        </div>
      </main>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Website Settings</DialogTitle>
            <DialogDescription>
              Manage your website monitoring configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Site Name
                </label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={loading}
                  placeholder="Enter site name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-url" className="text-sm font-medium">
                  URL
                </label>
                <Input
                  id="edit-url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  disabled={loading}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-red-900">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this website and all its monitoring data.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete Website
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateWebsite}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Website</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{website?.name}&quot;? This action cannot be undone and will permanently remove all monitoring data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWebsite}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Website"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 