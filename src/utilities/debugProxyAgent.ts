import * as TunnelAgent from 'tunnel-agent';
import * as Url from 'url';

/*
 * Some HTTP libraries require an agent to be expressed in order to see traffic in Fiddler or Charles
 * So derive the agent from configuration settings
 */
export class DebugProxyAgent {

    /*
     * Create the agent if there is a proxy environment variable
     */
    public static initialize(useProxy: boolean, proxyUrl: string): void {

        // Can be used as a short term hack to get SSL trust working
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        if (useProxy) {
            const opts = Url.parse(proxyUrl);
            DebugProxyAgent._agent = TunnelAgent.httpsOverHttp({
                proxy: opts,
            });
        }
    }

    /*
     * Return the configured agent
     */
    public static get(): any {
        return DebugProxyAgent._agent;
    }

    /*
     * Return true if debugging
     */
    public static isDebuggingActive(): any {
        return DebugProxyAgent._agent !== null;
    }

    // The global agent instance
    private static _agent: any;
}
