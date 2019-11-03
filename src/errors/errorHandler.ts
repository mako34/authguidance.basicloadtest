import {LoadTestError} from './loadTestError';

/*
 * A basic error translation class
 */
export class ErrorHandler {

    /*
     * Collect error data from an API response
     */
    public static fromHttpResponse(errorCode: any, error: any): LoadTestError {

        // Create a typed error
        const responseBody = error.body;
        const loadTestError = new LoadTestError(errorCode, 'Problem encountered during an HTTP request');

        if (responseBody) {
            loadTestError.setDetails(responseBody);
        } else if (error.message) {
            loadTestError.setDetails(error.message);
        }

        if (loadTestError.stack) {
            loadTestError.addStackFrames(loadTestError.stack);
        }
        if (error.stack) {
            loadTestError.addStackFrames(error.stack);
        }

        return loadTestError;
    }

    /*
     * Collect error data from an exception in the client side code
     */
    public static fromException(exception: any) {

        // Already handled
        if (exception instanceof LoadTestError) {
            return exception as LoadTestError;
        }

        // Create a typed error
        const loadTestError = new LoadTestError('load_test_exception', 'Problem encountered in the load test');
        if (exception.message) {
            loadTestError.setDetails(exception.message);
        }

        if (loadTestError.stack) {
            loadTestError.addStackFrames(loadTestError.stack);
        }
        if (exception.stack) {
            loadTestError.addStackFrames(exception.stack);
        }

        return loadTestError;
    }
}
