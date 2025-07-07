"use client";

import { useState, useEffect } from "react";
import { CartesianGrid, Dot, Line, LineChart, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const generateChartData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000);
    const hour = time.getHours();

    const baseResponseTime = 120 + Math.sin((hour / 24) * Math.PI * 2) * 40;
    let responseTime = Math.round(baseResponseTime + Math.random() * 60);

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
      time: time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
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
      <svg
        x={cx - 6}
        y={cy - 6}
        width="12"
        height="12"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="var(--color-red-500)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 6L6 18M6 6l12 12"
        />
      </svg>
    );
  }

  let fill = "var(--chart-1)";
  if (status >= 500) {
    fill = "var(--color-red-500)";
  } else if (status >= 400) {
    fill = "var(--color-yellow-500)";
  } else if (status >= 200) {
    fill = "var(--color-green-500)";
  }

  return <Dot cx={cx} cy={cy} r={4} fill={fill} />;
};

const CustomTooltipContent = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 text-sm bg-background/90 border rounded-lg shadow-lg">
        <p className="font-bold">{`Time: ${label}`}</p>
        <p>{`Response Time: ${data.responseTime}ms`}</p>
        <p>{`Status: ${data.status}`}</p>
      </div>
    );
  }
  return null;
};

export default function WebsiteCard({ siteName }: { siteName: string }) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setChartData(generateChartData());
  }, []);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{siteName}</CardTitle>
          <CardDescription>A short description of the website.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[175px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div>Last checked: -</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>-</span>
          </div>
        </CardFooter>
      </Card>
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
    if (lastStatus >= 500) return { category: "Offline", color: "bg-red-500 hover:bg-red-500/80" };
    if (lastStatus >= 400) return { category: "Warning", color: "bg-yellow-500 hover:bg-yellow-500/80" };
    return { category: "Online", color: "bg-green-500 hover:bg-green-500/80" };
  };

  const { category: lastStatusCategory, color: statusColorClass } = getStatus();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-3xl">{siteName}</CardTitle>
        <Badge className={cn("text-white", statusColorClass)}>
          {lastStatusCategory}: {lastStatus}
        </Badge>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 20,
              right: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 5)}
              interval={3}
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltipContent />}
            />
            <Line
              dataKey="responseTime"
              type="natural"
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
        <div className="text-sm text-muted-foreground">Last checked: Just now</div>
      </CardFooter>
    </Card>
  );
}