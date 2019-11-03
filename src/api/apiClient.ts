import * as got from 'got';
import {AppConfiguration} from '../configuration/appConfiguration';
import {ErrorHandler} from '../errors/errorHandler';
import {CallContext} from '../utilities/callContext';
import {DebugProxyAgent} from '../utilities/debugProxyAgent';

/*
 * A class via which to call our API
 */
export class ApiClient {

    private readonly _configuration: AppConfiguration;

    public constructor(configuration: AppConfiguration) {
        this._configuration = configuration;
    }

    /*
     * Return claims from the API, which originated from the OAuth endpoint
     */
    public async getUserInfoClaims(accessToken: string, context: CallContext): Promise<CallContext> {

        return await this.getApiData(
            accessToken,
            '/userclaims/current',
            'GET',
            null,
            context);
    }

    /*
     * Return the list of companies
     */
    public async getCompanyList(accessToken: string, context: CallContext): Promise<CallContext> {

        return await this.getApiData(
            accessToken,
            '/companies',
            'GET',
            null,
            context);
    }

    /*
     * Return the transactions for a specific company
     */
    public async getCompanyTransactions(
        accessToken: string, id: number, context: CallContext): Promise<CallContext> {

        return await this.getApiData(
            accessToken,
            `/companies/${id}/transactions`,
            'GET',
            null,
            context);
    }

    /*
     * A parameterised way to call the API and handle common aspects only once
     */
    private async getApiData(
        accessToken: string,
        path: string,
        method: string,
        payload: any,
        context: CallContext): Promise<CallContext> {

        // Common headers
        const headers: any =  {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        };

        // Add headers used for correlation and testing
        const customHeaders = context.customHeaders;
        for (const header in customHeaders) {
            if (header) {
                headers[header] = customHeaders[header];
            }
        }

        // Wait for up to 10 seconds and avoid the default behaviour of retrying a 500 error
        const options: any = {
            method,
            headers,
            json: true,
            agent: DebugProxyAgent.get(),
            timeout: 10000,
            retry: 0,
        };

        // Add a payload if needed
        if (payload) {
            options.body = payload;
        }

        // Start measuring performance
        const startTime = process.hrtime();

        try {

            // Call the API
            const url = `${this._configuration.apiBaseUrl}${path}`;
            const response = await got(url, options);

            // Record the status code
            if (response.statusCode) {
                context.statusCode = response.statusCode;
            }

            context.response = response.body;

        } catch (e) {

            // Record the status code
            if (e.statusCode) {
                context.statusCode = e.statusCode;
            }

            // Set error details
            if (e.body && e.body.code) {
                context.error = ErrorHandler.fromHttpResponse(e.body.code, e);
            } else {
                context.error = ErrorHandler.fromHttpResponse('api_request_error', e);
            }

        } finally {

            // Report the time taken
            const endTime = process.hrtime(startTime);
            context.millisecondsTaken = Math.floor((endTime[0] * 1000000000 + endTime[1]) / 1000000);
        }

        return context;
    }
}
