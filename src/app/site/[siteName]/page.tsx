"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CartesianGrid,
  Dot,
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
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import Header from "@/components/header";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StatCard from "@/components/stat-card";

const generateChartData = (timeRange: string) => {
  const data = [];
  const now = new Date();
  let points = 0;
  let intervalMinutes = 0;

  switch (timeRange) {
    case "1h":
      points = 12;
      intervalMinutes = 5;
      break;
    case "6h":
      points = 72;
      intervalMinutes = 5;
      break;
    case "24h":
      points = 288;
      intervalMinutes = 5;
      break;
    case "7d":
      points = 168; // 1 point per hour
      intervalMinutes = 60;
      break;
    case "30d":
      points = 120; // 1 point per 6 hours
      intervalMinutes = 360;
      break;
    default:
      points = 288;
      intervalMinutes = 5;
  }

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    const hour = time.getHours();

    const baseResponseTime = 150 + Math.sin((hour / 24) * Math.PI * 2) * 50;
    let responseTime = Math.round(baseResponseTime + Math.random() * 80);

    let status = 200;
    const random = Math.random();
    if (random > 0.98) {
      status = 0; // Timeout
      responseTime = 0;
    } else if (random > 0.95) {
      status = 500 + Math.floor(Math.random() * 4);
    } else if (random > 0.9) {
      status = 400 + Math.floor(Math.random() * 5);
    }

    data.push({
      time: time.toISOString(), // Use ISO string for the full timestamp
      responseTime,
      status,
    });
  }
  return data;
};

const chartConfig = {
  responseTime: {
    label: "Response Time",
    color: "var(--chart-1)",
  },
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const { status } = payload;

  if (status === 0) {
    return (
      <svg x={cx - 6} y={cy - 6} width="12" height="12" fill="none" viewBox="0 0 24 24">
        <path stroke="var(--color-red-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
      </svg>
    );
  }

  let fill = "var(--chart-1)";
  if (status >= 500) fill = "var(--color-red-500)";
  else if (status >= 400) fill = "var(--color-yellow-500)";
  else if (status >= 200) fill = "var(--color-green-500)";

  return <Dot cx={cx} cy={cy} r={3} fill={fill} />;
};

const CustomTooltipContent = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    let statusColorClass = "bg-green-500";
    if (data.status === 0) {
      statusColorClass = "bg-gray-500";
    } else if (data.status >= 500) {
      statusColorClass = "bg-red-500";
    } else if (data.status >= 400) {
      statusColorClass = "bg-yellow-500";
    }

    const date = new Date(label);
    const formattedLabel = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <div className="p-2 text-sm bg-background/90 border rounded-lg shadow-lg">
        <p className="font-bold">{formattedLabel}</p>
        <p>{`Response Time: ${data.responseTime}ms`}</p>
        <div className="flex items-center gap-2">
          <p>{`Status: ${data.status}`}</p>
          <span className={cn("w-2 h-2 rounded-full", statusColorClass)} />
        </div>
      </div>
    );
  }
  return null;
};

export default function SiteDashboardPage() {
  const params = useParams<{ siteName: string }>();
  const [timeRange, setTimeRange] = useState("6h");
  const [chartData, setChartData] = useState<any[]>([]);
  const siteName = decodeURIComponent(params.siteName);

  useEffect(() => {
    setChartData(generateChartData(timeRange));
  }, [timeRange]);

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
    const uptime = (successfulChecks / chartData.length) * 100;
    const incidents = chartData.length - successfulChecks;

    return {
      avgResponseTime,
      uptime: parseFloat(uptime.toFixed(2)),
      totalChecks: chartData.length,
      incidents,
    };
  };

  const stats = calculateStats();

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
              <h2 className="text-3xl font-bold">{siteName}</h2>
            </div>
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
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-96 w-full">
                  <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
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
                  <p className="text-muted-foreground">Loading chart data...</p>
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
        </div>
      </main>
    </div>
  );
} 