import * as color from 'colors';
import * as OpenIdClient from 'openid-client';
import {Configuration} from '../configuration/configuration';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorHandler} from '../errors/errorHandler';
import {DebugProxyAgent} from '../utilities/debugProxyAgent';

/*
 * A class to do authenication using the resource owner password grant
 */
export class Authenticator {

    private readonly _configuration: OAuthConfiguration;
    private _issuer: any;

    public constructor(configuration: Configuration) {
        this._configuration = configuration.oauth;
    }

    /*
     * Load metadata
     */
    public async initialise(): Promise<void> {

        OpenIdClient.Issuer.defaultHttpOptions = {
            timeout: 10000,
            agent: DebugProxyAgent.get(),
        };

        // Try to download metadata
        const startTime = process.hrtime();
        try {
            const endpoint = `${this._configuration.authority}/.well-known/openid-configuration`;
            this._issuer = await OpenIdClient.Issuer.discover(endpoint);

        } catch (e) {
            throw ErrorHandler.fromHttpResponse('metadata_download_error', e);

        } finally {

            // Report time taken
            const endTime = process.hrtime(startTime);
            const millisecondsTaken = Math.floor((endTime[0] * 1000000000 + endTime[1]) / 1000000);
            console.log(
                color.yellow(
                    `Time to download Open Id Connect Metadata: ${millisecondsTaken} milliseconds`));
        }
    }

    /*
     * Make the authentication request and get a token
     */
    public async getAccessToken(): Promise<string> {

        // Create the OAuth client
        const client = new this._issuer.Client({
            client_id: this._configuration.clientId,
            client_secret: this._configuration.clientSecret,
        });

        // Try to authenticate
        const startTime = process.hrtime();
        try {
            const tokenData = await client.grant({
                grant_type: 'password',
                username: this._configuration.userId,
                password: this._configuration.password,
                scope: 'openid email profile',
            });
            return tokenData.access_token;

        } catch (e) {
            throw ErrorHandler.fromHttpResponse('password_grant_error', e);

        } finally {

            // Report time taken
            const endTime = process.hrtime(startTime);
            const millisecondsTaken = Math.floor((endTime[0] * 1000000000 + endTime[1]) / 1000000);
            console.log(
                color.yellow(
                    `Time to authenticate via Resource Owner Password Grant: ${millisecondsTaken} milliseconds`));
        }
    }
}
