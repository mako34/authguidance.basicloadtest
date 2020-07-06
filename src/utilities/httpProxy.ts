import {AxiosProxyConfig} from 'axios';
import TunnelAgent from 'tunnel-agent';
import url from 'url';

/*
 * Manage supplying the HTTP proxy on API calls and AppAuth-JS requests
 */
export class HttpProxy {

    /*
     * Set configuration
     */
    public static initialize(useProxy: boolean, proxyHost: string, proxyPort: number): void {

        if (useProxy) {
            HttpProxy._configuration = {
                host: proxyHost,
                port: proxyPort,
            }
        }
    }

    /*
     * Return the configured details for Axios calls
     */
    public static get(): AxiosProxyConfig | undefined {
        return HttpProxy._configuration ?? undefined;
    }

    /*
     * Return the configured details for HTTP libraries that require a tunnel agent
     */
    public static getTunnelAgent(): any {

        if (HttpProxy._configuration) {
            const proxyUrl = `${HttpProxy._configuration.host}:${HttpProxy._configuration.port}`;
            const opts = url.parse(proxyUrl);
            return TunnelAgent.httpsOverHttp({
                proxy: opts,
            });
        }

        return null;
    }

    // The global proxy configuration
    private static _configuration: AxiosProxyConfig | null = null;
}
