import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
    BaseStatusResult,
    createStatusResult,
    logStatusResult,
} from "@/lib/status-results";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        // Use service role client to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );

        const { data: websites, error: fetchError } = await supabase
            .from("websites")
            .select("*");

        if (fetchError) {
            console.error("Error fetching websites:", fetchError);
            return NextResponse.json({ error: "Failed to fetch websites" }, {
                status: 500,
            });
        }

        if (!websites || websites.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No websites to check",
                timestamp: new Date().toISOString(),
            });
        }

        const results = await Promise.allSettled(
            websites.map(async (website) => {
                const startTime = Date.now();
                let result: BaseStatusResult;

                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(
                        () => controller.abort(),
                        10000,
                    );

                    const response = await fetch(website.url, {
                        method: "GET",
                        signal: controller.signal,
                        headers: {
                            "User-Agent": "StatusDeck Monitor/1.0",
                        },
                    });

                    clearTimeout(timeoutId);

                    const responseTime = Date.now() - startTime;
                    const statusCode = response.status;

                    result = createStatusResult(
                        statusCode,
                        responseTime,
                        website.url,
                        false,
                    );
                } catch {
                    const responseTime = Date.now() - startTime;

                    result = createStatusResult(
                        0,
                        responseTime,
                        website.url,
                        true,
                    );
                }

                const dbRecord = result.toDbRecord(website.id);
                await supabase.from("status_checks").insert(dbRecord);

                logStatusResult(result);

                return {
                    website: website.name,
                    status: result.getStatusText(),
                    responseTime: result.responseTime,
                    statusCode: result.statusCode,
                    message: result.getDisplayMessage(),
                };
            }),
        );

        const successful = results.filter((r) =>
            r.status === "fulfilled"
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        console.log(
            `Status check completed: ${successful} successful, ${failed} failed`,
        );

        return NextResponse.json({
            success: true,
            message: `Checked ${websites.length} websites`,
            results: {
                total: websites.length,
                successful,
                failed,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Status check cron error:", error);
        return NextResponse.json({ error: "Internal server error" }, {
            status: 500,
        });
    }
}
