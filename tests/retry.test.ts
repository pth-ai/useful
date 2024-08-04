import {retryPromise} from "../lib";

describe('RetryPromise Functionality', () => {

    it('should successfully resolve on first attempt', async () => {
        const action = () => Promise.resolve("success");
        const result = await retryPromise("testAction", action, 3);
        expect(result).toEqual("success");
    });

    it('should retry until successful', async () => {
        let attemptCounter = 0;
        const action = () => new Promise((resolve, reject) => {
            attemptCounter++;
            if (attemptCounter < 3) {
                reject("failed");
            } else {
                resolve("success");
            }
        });
        const result = await retryPromise("retryUntilSuccess", action, 3);
        expect(result).toEqual("success");
    });

    it('should throw after exceeding max retries', async () => {
        const action = () => Promise.reject(new Error("failed"));
        try {
            await retryPromise("exceedMaxRetries", action, 2);
            throw new Error("Expected to throw after max retries but did not");
        } catch (e: any) {
            expect(e.message).toEqual("failed");
        }
    });

    it('should use lastFallback function if provided after retries fail', async () => {
        const action = () => Promise.reject(new Error("failed"));
        const lastFallback = () => Promise.resolve("fallback success");
        const result = await retryPromise("withFallback", action, 2, undefined, lastFallback);
        expect(result).toEqual("fallback success");
    });

    it('should not retry if ignoreErrors returns true', async () => {
        let attemptCounter = 0;
        const action = () => new Promise((_resolve, reject) => {
            attemptCounter++;
            reject(new Error("ignore this error"));
        });
        try {
            await retryPromise("ignoreError", action, 3, (e) => e.message === "ignore this error");
            throw new Error("Expected to throw immediately but did not");
        } catch (e: any) {
            expect(e.message).toEqual("ignore this error");
            expect(attemptCounter).toEqual(1); // No retries should have occurred
        }
    });

});
