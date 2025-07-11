import {
  Zap,
  Shield,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import AnalysisCard from "./analysis-card";

interface ChartData {
  time: string;
  responseTime: number;
  status: number;
}

interface Stats {
  averageResponseTime: number;
  uptime: number;
  incidents: number;
  totalChecks: number;
}

interface PerformanceAnalysisProps {
  stats: Stats;
  chartData: ChartData[];
}

export default function PerformanceAnalysis({
  stats,
  chartData,
}: PerformanceAnalysisProps) {
  const getResponseTimeInsight = () => {
    const { averageResponseTime } = stats;
    if (averageResponseTime === 0)
      return {
        icon: Clock,
        title: "Response Time Analysis",
        recommendation: "No data available to analyze response time.",
        status: "neutral" as const,
        metric: "No data",
      };
    if (averageResponseTime < 200)
      return {
        icon: Zap,
        title: "Response Time",
        recommendation:
          "Outstanding performance! Your site delivers lightning-fast responses that create an exceptional user experience and boost SEO rankings.",
        status: "excellent" as const,
        metric: `${averageResponseTime}ms`,
      };
    if (averageResponseTime < 500)
      return {
        icon: TrendingUp,
        title: "Response Time",
        recommendation:
          "Great performance! Your site responds quickly, keeping users engaged and search engines happy.",
        status: "good" as const,
        metric: `${averageResponseTime}ms`,
      };
    if (averageResponseTime < 1000)
      return {
        icon: Clock,
        title: "Response Time",
        recommendation: (
          <>
            <p className="mb-2">
              Performance is acceptable but has room for improvement. A faster
              site leads to better user engagement and SEO.
            </p>
            <p>
              <strong>Next Steps:</strong> Look into optimizing large images,
              enabling Gzip compression on your server, or analyzing your
              database for slow queries.
            </p>
          </>
        ),
        status: "warning" as const,
        metric: `${averageResponseTime}ms`,
      };
    return {
      icon: AlertCircle,
      title: "Response Time",
      recommendation: (
        <>
                      <p className="mb-2">
              Your site&apos;s slow response is likely frustrating users and hurting
              conversions. This requires attention.
            </p>
            <p>
              <strong>Potential Causes:</strong> This could be due to an
              underpowered hosting plan, inefficient backend code, or a lack of
              caching. A Content Delivery Network (CDN) can also dramatically
              help by serving assets from locations closer to your users.
            </p>
        </>
      ),
      status: "critical" as const,
      metric: `${averageResponseTime}ms`,
    };
  };

  const getUptimeInsight = () => {
    const { uptime } = stats;
    if (stats.totalChecks === 0)
      return {
        icon: Shield,
        title: "Uptime Analysis",
        recommendation: "Not enough data to calculate uptime reliably.",
        status: "neutral" as const,
        metric: "No data",
      };
    if (uptime >= 99.9)
      return {
        icon: CheckCircle2,
        title: "Site Reliability",
        recommendation:
          "Exceptional uptime! Your site is rock-solid reliable, building strong user trust and maintaining excellent search engine rankings.",
        status: "excellent" as const,
        metric: `${uptime}%`,
      };
    if (uptime >= 99)
      return {
        icon: Shield,
        title: "Site Reliability",
        recommendation:
          "Great reliability! Your site maintains high uptime with minimal disruptions to user experience.",
        status: "good" as const,
        metric: `${uptime}%`,
      };
    return {
      icon: AlertCircle,
      title: "Site Reliability",
      recommendation: (
        <>
          <p className="mb-2">
            Your site has experienced significant downtime. Uptime below 99%
            can damage user trust and hurt search rankings.
          </p>
                      <p>
              <strong>What to check:</strong> Review your server logs around the
              times of the incidents for error messages. Monitor your server&apos;s
              CPU and memory usage to check for resource exhaustion. If issues
              persist, consider moving to a more reliable hosting provider.
            </p>
        </>
      ),
      status: "critical" as const,
      metric: `${uptime}%`,
    };
  };

  const getErrorInsight = () => {
    const errors = chartData.filter((d) => d.status < 200 || d.status >= 300);
    if (errors.length === 0) {
      return {
        icon: CheckCircle2,
        title: "Error Analysis",
        recommendation:
          "Excellent! No significant errors detected. Your site is serving content reliably without major issues.",
        status: "excellent" as const,
        metric: "0 errors",
      };
    }

    const errorCounts = errors.reduce((acc, error) => {
      const statusCode = error.status;
      acc[statusCode] = (acc[statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostCommonError = Object.keys(errorCounts)
      .map(Number)
      .sort((a, b) => errorCounts[b] - errorCounts[a])[0];

    if (mostCommonError === 0) {
      return {
        icon: AlertCircle,
        title: "Error Analysis",
        recommendation: (
          <>
            <p className="mb-2">
              Your site is frequently failing to respond within the 10-second
              window. This is a critical issue that means users cannot access
              your site.
            </p>
            <p>
              <strong>Common Causes:</strong> This can happen if your web
              server isn&apos;t running, is overloaded with traffic, or a firewall
              is blocking our monitoring requests. Long-running database
              queries can also be a culprit.
            </p>
          </>
        ),
        status: "critical" as const,
        metric: `${errorCounts[0]} timeouts`,
      };
    }
    if (mostCommonError >= 500) {
      return {
        icon: AlertCircle,
        title: "Error Analysis",
        recommendation: (
          <>
            <p className="mb-2">
              Your site is returning server-side errors ({mostCommonError}).
              This points to a problem with your application&apos;s backend code or
              infrastructure.
            </p>
            <p>
              <strong>Troubleshooting:</strong> Check your application and
              server logs for error stack traces. Review any recent code
              deployments that might have introduced a bug. Also, ensure
              external services like databases or APIs are functioning
              correctly.
            </p>
          </>
        ),
        status: "critical" as const,
        metric: `${errorCounts[mostCommonError]} errors`,
      };
    }
    if (mostCommonError >= 400) {
      return {
        icon: AlertCircle,
        title: "Error Analysis",
        recommendation: (
          <>
            <p className="mb-2">
              Your site is returning client-side errors ({mostCommonError}).
              These errors are often visible to your users and can degrade
              their experience.
            </p>
            <p>
              <strong>Common Fixes:</strong> If you&apos;re seeing 404 errors,
              check for broken links or recently moved content. For 403 errors,
              verify the file and folder permissions on your server. For 401
              errors, there may be an issue with a password-protected page.
            </p>
          </>
        ),
        status: "warning" as const,
        metric: `${errorCounts[mostCommonError]} errors`,
      };
    }

    return {
      icon: AlertCircle,
      title: "Error Analysis",
      recommendation:
        "Mixed error patterns detected. Review your monitoring data for detailed error breakdown and resolution steps.",
      status: "neutral" as const,
      metric: `${errors.length} errors`,
    };
  };

  const insights = [
    getResponseTimeInsight(),
    getUptimeInsight(),
    getErrorInsight(),
  ];

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          Performance Analysis
        </h2>
        <p className="text-gray-600">
          Actionable insights to optimize your site&apos;s performance and reliability
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <AnalysisCard key={index} {...insight} />
        ))}
      </div>
    </div>
  );
} 