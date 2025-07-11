import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisCardProps {
  icon: LucideIcon;
  title: string;
  recommendation: React.ReactNode;
  status: "excellent" | "good" | "warning" | "critical" | "neutral";
  metric?: string;
}

export default function AnalysisCard({
  icon: Icon,
  title,
  recommendation,
  status,
  metric,
}: AnalysisCardProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "excellent":
        return {
          iconBg: "bg-emerald-50 border-emerald-200",
          iconColor: "text-emerald-600",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          badgeText: "Excellent",
        };
      case "good":
        return {
          iconBg: "bg-blue-50 border-blue-200",
          iconColor: "text-blue-600",
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          badgeText: "Good",
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 border-amber-200",
          iconColor: "text-amber-600",
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          badgeText: "Needs Attention",
        };
      case "critical":
        return {
          iconBg: "bg-red-50 border-red-200",
          iconColor: "text-red-600",
          badge: "bg-red-50 text-red-700 border-red-200",
          badgeText: "Critical",
        };
      default:
        return {
          iconBg: "bg-gray-50 border-gray-200",
          iconColor: "text-gray-600",
          badge: "bg-gray-50 text-gray-700 border-gray-200",
          badgeText: "Info",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl border ${styles.iconBg}`}>
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {title}
              </h3>
              <Badge
                variant="outline"
                className={`text-xs font-medium ${styles.badge}`}
              >
                {styles.badgeText}
              </Badge>
            </div>
            {metric && (
              <p className="text-lg font-bold text-gray-900 mb-2">{metric}</p>
            )}
            <div className="text-sm text-gray-600 leading-relaxed">
              {recommendation}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 