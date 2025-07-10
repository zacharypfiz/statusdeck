"use client";

import { useState, useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  CustomDot,
  CustomTooltipContent,
  chartConfig,
} from "./shared-chart-components";
import { generateChartData } from "@/lib/mock-data";

export default function WebsiteCard({
  website,
  isDemo = false,
}: {
  website: { id: string; name: string; url: string };
  isDemo?: boolean;
}) {
  const [chartData, setChartData] = useState<{time: string; responseTime: number; status: number}[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (isDemo) {
      setChartData(generateChartData());
    } else {
      fetchRealData();
    }
  }, [website.id, isDemo]);

  const fetchRealData = async () => {
    const { data: statusChecks } = await supabase
      .from("status_checks")
      .select("*")
      .eq("website_id", website.id)
      .order("checked_at", { ascending: false })
      .limit(24);

    if (statusChecks && statusChecks.length > 0) {
      const formattedData = statusChecks.reverse().map((check) => ({
        time: new Date(check.checked_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
        responseTime: check.response_time || 0,
        status: check.status_code || 0,
      }));
      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  };

  if (chartData.length === 0) {
    const message = isDemo ? "Loading chart..." : "No monitoring data yet";
    return (
      <Link href={`/site/${encodeURIComponent(website.name)}`}>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-3xl">{website.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[175px] w-full flex items-center justify-center">
              <p className="text-muted-foreground">{message}</p>
          </div>
        </CardContent>
          <CardFooter className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground">Avg. Response</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="w-4 h-4" />
          </div>
        </CardFooter>
      </Card>
      </Link>
    );
  }

  const responseTimes = chartData
    .map((d) => d.responseTime)
    .filter((rt) => rt > 0);
  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

  const lastCheck = chartData[chartData.length - 1];
  const lastStatus = lastCheck.status;

  const getStatus = () => {
    if (lastStatus === 0) return { category: "Timeout", color: "bg-gray-500 hover:bg-gray-500/80" };
    if (lastStatus >= 500) return { category: "Server Error", color: "bg-red-500 hover:bg-red-500/80" };
    if (lastStatus >= 400) return { category: "Client Error", color: "bg-yellow-500 hover:bg-yellow-500/80" };
    if (lastStatus >= 300) return { category: "Redirect", color: "bg-blue-500 hover:bg-blue-500/80" };
    if (lastStatus >= 200) return { category: "Online", color: "bg-green-500 hover:bg-green-500/80" };
    return { category: "Unknown", color: "bg-gray-500 hover:bg-gray-500/80" };
  };

  const { category: lastStatusCategory, color: statusColorClass } = getStatus();

  return (
    <Link href={`/site/${encodeURIComponent(website.name)}`}>
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl">{website.name}</CardTitle>
          <Badge className={cn("text-white", statusColorClass)}>
            {lastStatusCategory}: {lastStatus}
          </Badge>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 20, right: 10, bottom: 0, left: 25 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={3}
              />
              <ChartTooltip
                cursor={false}
                content={<CustomTooltipContent />}
              />
              <Line
                dataKey="responseTime"
                type="monotone"
                stroke="var(--color-responseTime)"
                strokeWidth={2}
                dot={<CustomDot />}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex justify-between items-end">
          <div>
            <p className="text-2xl font-bold text-foreground">{avgResponseTime}ms</p>
            <p className="text-xs text-muted-foreground">Avg. Response</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}