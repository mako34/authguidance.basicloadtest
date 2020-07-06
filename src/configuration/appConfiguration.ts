/*
 * Settings related to the API connection
 */
export interface AppConfiguration {
    apiBaseUrl: string;
    useProxy: boolean;
    proxyHost: string;
    proxyPort: number;
}
