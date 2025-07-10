"use client";

import { cn } from "@/lib/utils";
import { Dot } from "recharts";

interface ChartDataPoint {
  time: string;
  responseTime: number;
  status: number;
}

export const chartConfig = {
  responseTime: {
    label: "Response Time",
    color: "var(--chart-1)",
  },
};

export const CustomDot = (props: {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
}) => {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  const { status } = payload;

  if (status === 0) {
    return (
      <svg
        x={cx ? cx - 6 : 0}
        y={cy ? cy - 6 : 0}
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
  } else if (status >= 300) {
    fill = "var(--color-blue-500)";
  } else if (status >= 200) {
    fill = "var(--color-green-500)";
  }

  return <Dot cx={cx} cy={cy} r={4} fill={fill} />;
};

export const CustomTooltipContent = (props: {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
  label?: string;
}) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    let statusColorClass = "bg-green-500";
    let statusText = "Online";
    
    if (data.status === 0) {
      statusColorClass = "bg-gray-500";
      statusText = "Timeout";
    } else if (data.status >= 500) {
      statusColorClass = "bg-red-500";
      statusText = "Server Error";
    } else if (data.status >= 400) {
      statusColorClass = "bg-yellow-500";
      statusText = "Client Error";
    } else if (data.status >= 300) {
      statusColorClass = "bg-blue-500";
      statusText = "Redirect";
    } else if (data.status >= 200) {
      statusColorClass = "bg-green-500";
      statusText = "Success";
    }

    const date = new Date(label || "");
    let formattedLabel = label || "";

    if (label && label.includes("T")) {
      formattedLabel = date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return (
      <div className="p-3 text-sm bg-background/95 border rounded-lg shadow-lg">
        <p className="font-bold">{formattedLabel}</p>
        <p className="text-muted-foreground">{`Response Time: ${data.responseTime}ms`}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="font-medium">{`${statusText} (${data.status})`}</p>
          <span className={cn("w-2 h-2 rounded-full", statusColorClass)} />
        </div>
      </div>
    );
  }
  return null;
}; 