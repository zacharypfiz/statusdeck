import { describe, expect, it } from "vitest";
import { calculatePerformanceStats, type CheckResult } from "./utils";

describe("calculatePerformanceStats", () => {
    it("should correctly calculate uptime percentage from a list of checks", () => {
        // 1. Arrange: Create a mock list of check results
        const mockResults: CheckResult[] = [
            // 9 successful checks
            { status: "Online", response_time: 100, status_code: 200 },
            { status: "Online", response_time: 120, status_code: 200 },
            { status: "Online", response_time: 90, status_code: 200 },
            { status: "Online", response_time: 110, status_code: 200 },
            { status: "Online", response_time: 130, status_code: 200 },
            { status: "Online", response_time: 95, status_code: 200 },
            { status: "Online", response_time: 105, status_code: 200 },
            { status: "Online", response_time: 115, status_code: 200 },
            { status: "Online", response_time: 125, status_code: 200 },
            // 1 failed check
            { status: "Error", response_time: 0, status_code: 500 },
        ];

        // 2. Act: Call the function with the mock data
        const stats = calculatePerformanceStats(mockResults);

        // 3. Assert: Verify the calculated statistics
        expect(stats.totalChecks).toBe(10);
        expect(stats.incidents).toBe(1);
        expect(stats.uptime).toBe(90);
    });
});
