import { Layout } from '../../../shared/ui/Layout';
import { Mail, MessageCircle, ExternalLink } from 'lucide-react';

export function HelpPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-zinc-100">Help & Support</h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Need Help?</h2>
          <p className="text-zinc-400 leading-relaxed">
            If you have any questions or need assistance with Cloaka, we're here to help.
            Check out the resources below or contact our support team.
          </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Contact Support</h2>
          <div className="space-y-4">
            <a
              href="mailto:support@cloaka.io"
              className="flex items-center gap-3 p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Mail className="w-5 h-5 text-brand-400" />
              <div>
                <div className="text-zinc-200 font-medium">Email Support</div>
                <div className="text-zinc-400 text-sm">support@cloaka.io</div>
              </div>
            </a>
            <a
              href="https://t.me/cloaka_support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-brand-400" />
              <div>
                <div className="text-zinc-200 font-medium">Telegram</div>
                <div className="text-zinc-400 text-sm">@cloaka_support</div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 ml-auto" />
            </a>
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-zinc-200 font-medium mb-2">How do I create a new stream?</h3>
              <p className="text-zinc-400 text-sm">
                Go to Streams page and click "New Stream" button. Fill in the required fields and save.
              </p>
            </div>
            <div>
              <h3 className="text-zinc-200 font-medium mb-2">What's the difference between Redirect and Fingerprint modes?</h3>
              <p className="text-zinc-400 text-sm">
                Redirect mode performs server-side checks and redirects traffic. Fingerprint mode uses 
                client-side JavaScript for more advanced bot detection.
              </p>
            </div>
            <div>
              <h3 className="text-zinc-200 font-medium mb-2">How do I restore a deleted stream?</h3>
              <p className="text-zinc-400 text-sm">
                Deleted streams are moved to Trash where they stay for 30 days. Go to Trash page to restore them.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
