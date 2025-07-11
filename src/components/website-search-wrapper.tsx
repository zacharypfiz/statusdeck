"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import WebsiteCard from "@/components/website-card";

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

export default function WebsiteSearchWrapper({
  websites,
  isDemo,
}: {
  websites: { id: string; name: string; url: string }[];
  isDemo: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [websiteStatuses, setWebsiteStatuses] = useState<Record<string, number>>({});
  const supabase = createClient();

  useEffect(() => {
    const fetchWebsiteStatuses = async () => {
      if (isDemo) return;
      
      const statusPromises = websites.map(async (website) => {
        const { data: statusChecks } = await supabase
          .from("status_checks")
          .select("status_code")
          .eq("website_id", website.id)
          .order("checked_at", { ascending: false })
          .limit(1);

        const latestStatus = statusChecks?.[0]?.status_code || 0;
        return { websiteId: website.id, status: latestStatus };
      });

      const results = await Promise.all(statusPromises);
      const statusMap = results.reduce((acc, { websiteId, status }) => {
        acc[websiteId] = status;
        return acc;
      }, {} as Record<string, number>);

      setWebsiteStatuses(statusMap);
    };

    fetchWebsiteStatuses();
  }, [websites, isDemo, supabase]);

  const filteredWebsites = websites.filter((website) => {
    const matchesSearch = website.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") {
      return matchesSearch;
    }
    
    const latestStatus = websiteStatuses[website.id] || 0;
    const statusCategory = getStatusCategory(latestStatus);
    const matchesStatus = statusFilter === statusCategory;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Search websites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWebsites.map((site) => (
          <WebsiteCard key={site.id} website={site} isDemo={isDemo} />
        ))}
      </div>

      {filteredWebsites.length === 0 && (searchTerm || statusFilter !== "all") && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No websites found matching your search criteria
          </p>
        </div>
      )}
    </div>
  );
} 