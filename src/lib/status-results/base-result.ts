export abstract class BaseStatusResult {
    private readonly _statusCode: number;
    private readonly _responseTime: number;
    private readonly _timestamp: Date;
    private readonly _url: string;

    protected readonly _message: string;

    constructor(
        statusCode: number,
        responseTime: number,
        url: string,
        message: string,
    ) {
        this._statusCode = statusCode;
        this._responseTime = responseTime;
        this._timestamp = new Date();
        this._url = url;
        this._message = message;
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public get responseTime(): number {
        return this._responseTime;
    }

    public get timestamp(): Date {
        return this._timestamp;
    }

    public get url(): string {
        return this._url;
    }

    public abstract getDisplayMessage(): string;

    public abstract getStatusText(): string;

    public toDbRecord(websiteId: string) {
        return {
            website_id: websiteId,
            status: this.getStatusText(),
            response_time: this._responseTime,
            status_code: this._statusCode,
            checked_at: this._timestamp.toISOString(),
        };
    }

    protected formatResponseTime(): string {
        return `${this._responseTime}ms`;
    }
}
