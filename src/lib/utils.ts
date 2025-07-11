import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CheckResult {
  status: string;
  response_time: number;
  status_code: number | null;
}

export function calculatePerformanceStats(results: CheckResult[]) {
  if (results.length === 0) {
    return {
      uptime: 100,
      totalChecks: 0,
      incidents: 0,
      averageResponseTime: 0,
    };
  }

  const totalChecks = results.length;
  const successfulChecks = results.filter(
    (r) => r.status === "Online",
  );
  const incidents = totalChecks - successfulChecks.length;
  const uptime = (successfulChecks.length / totalChecks) * 100;

  const totalResponseTime = successfulChecks.reduce(
    (sum, r) => sum + r.response_time,
    0,
  );
  const averageResponseTime = successfulChecks.length > 0
    ? totalResponseTime / successfulChecks.length
    : 0;

  return {
    uptime: parseFloat(uptime.toFixed(2)),
    totalChecks,
    incidents,
    averageResponseTime: Math.round(averageResponseTime),
  };
}
