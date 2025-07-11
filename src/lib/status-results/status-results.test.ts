import { describe, expect, it } from "vitest";
import { SuccessResult } from "./success-result";

describe("SuccessResult", () => {
    it("should correctly store and return data for a successful website check", () => {
        // 1. Arrange: Set up the test data
        const statusCode = 200;
        const responseTime = 150;
        const url = "https://example.com";

        // 2. Act: Create an instance of the class
        const result = new SuccessResult(statusCode, responseTime, url);

        // 3. Assert: Verify the outcome
        expect(result.statusCode).toBe(statusCode);
        expect(result.responseTime).toBe(responseTime);
        expect(result.url).toBe(url);
        expect(result.getStatusText()).toBe("Online");
        expect(result.isHealthy()).toBe(true);
    });
});
