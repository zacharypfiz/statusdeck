import { BaseStatusResult } from "./base-result";

export class TimeoutResult extends BaseStatusResult {
    private readonly _timeoutDuration: number;

    constructor(
        responseTime: number,
        url: string,
        timeoutDuration: number = 10000,
    ) {
        super(0, responseTime, url, "Request timed out");

        this._timeoutDuration = timeoutDuration;
    }

    public getDisplayMessage(): string {
        return `${this._message} after ${
            this._timeoutDuration / 1000
        }s - Attempted for: ${this.formatResponseTime()}`;
    }

    public getStatusText(): string {
        return "Timeout";
    }

    public get timeoutDuration(): number {
        return this._timeoutDuration;
    }

    public wasQuickTimeout(): boolean {
        return this.responseTime < this._timeoutDuration / 2;
    }

    public getTimeoutReason(): string {
        if (this.wasQuickTimeout()) {
            return "Network unreachable or DNS resolution failed";
        }
        return "Server took too long to respond";
    }
}
