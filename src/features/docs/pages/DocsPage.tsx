import { Layout } from '../../../shared/ui/Layout';

export function DocsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-zinc-100">Documentation</h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">About Cloaka</h2>
          <p className="text-zinc-400 leading-relaxed">
            Cloaka is a traffic management and cloaking system designed for affiliate marketers. 
            It helps you filter traffic, detect bots, and route visitors based on various conditions.
          </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Key Features</h2>
          <ul className="space-y-3 text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">Stream Management</strong> - Create and manage traffic streams with custom rules and filters.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">Bot Detection</strong> - Identify and filter bot traffic using fingerprinting and user agent analysis.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">Geo Filtering</strong> - Allow or block traffic based on geographic location.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">VPN/Proxy Detection</strong> - Detect visitors using VPNs or proxies.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">Real-time Logs</strong> - Monitor all traffic with detailed logging and analytics.
              </div>
            </li>
          </ul>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Stream Modes</h2>
          <div className="space-y-3 text-zinc-400">
            <div>
              <strong className="text-zinc-200">Redirect Mode</strong> - Redirects allowed traffic to the offer URL and blocked traffic to the white URL.
            </div>
            <div>
              <strong className="text-zinc-200">Fingerprint Mode</strong> - Uses JavaScript fingerprinting for advanced bot detection before routing.
            </div>
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Getting Started</h2>
          <ol className="space-y-3 text-zinc-400 list-decimal list-inside">
            <li>Create a new stream in the Streams section</li>
            <li>Configure your offer URL (where allowed traffic goes)</li>
            <li>Set up your white URL (safe page for blocked traffic)</li>
            <li>Choose detection options (User Agent, Fingerprint, VPN, etc.)</li>
            <li>Optionally set geo restrictions</li>
            <li>Use the generated stream URL in your campaigns</li>
          </ol>
        </section>
      </div>
    </Layout>
  );
}
