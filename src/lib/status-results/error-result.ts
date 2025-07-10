import { BaseStatusResult } from "./base-result";

export class ErrorResult extends BaseStatusResult {
    private readonly _errorType: string;

    constructor(statusCode: number, responseTime: number, url: string) {
        super(statusCode, responseTime, url, "Request failed");

        this._errorType = this.determineErrorType(statusCode);
    }

    public getDisplayMessage(): string {
        return `${this._errorType} (${this.statusCode}) - Response time: ${this.formatResponseTime()}`;
    }

    public getStatusText(): string {
        return "Offline";
    }

    public get errorType(): string {
        return this._errorType;
    }

    public isClientError(): boolean {
        return this.statusCode >= 400 && this.statusCode < 500;
    }

    public isServerError(): boolean {
        return this.statusCode >= 500;
    }

    private determineErrorType(statusCode: number): string {
        if (statusCode >= 500) return "Server Error";
        if (statusCode >= 400) return "Client Error";
        if (statusCode >= 300) return "Redirect";
        return "Unknown Error";
    }
}
