import { BaseStatusResult } from "./base-result";

export class SuccessResult extends BaseStatusResult {
    constructor(statusCode: number, responseTime: number, url: string) {
        super(statusCode, responseTime, url, "Request successful");
    }

    public getDisplayMessage(): string {
        return `${this._message} - Response time: ${this.formatResponseTime()}`;
    }

    public getStatusText(): string {
        return "Online";
    }

    public isHealthy(): boolean {
        return this.responseTime < 5000;
    }
}
