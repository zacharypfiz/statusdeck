export { BaseStatusResult } from "./base-result";
export { SuccessResult } from "./success-result";
export { ErrorResult } from "./error-result";
export { TimeoutResult } from "./timeout-result";

import { BaseStatusResult } from "./base-result";
import { SuccessResult } from "./success-result";
import { ErrorResult } from "./error-result";
import { TimeoutResult } from "./timeout-result";

export function createStatusResult(
    statusCode: number,
    responseTime: number,
    url: string,
    isTimeout: boolean = false,
): BaseStatusResult {
    if (isTimeout) {
        return new TimeoutResult(responseTime, url);
    }

    if (statusCode >= 200 && statusCode < 300) {
        return new SuccessResult(statusCode, responseTime, url);
    }

    return new ErrorResult(statusCode, responseTime, url);
}

export function logStatusResult(result: BaseStatusResult): void {
    console.log(result.getDisplayMessage());
}
