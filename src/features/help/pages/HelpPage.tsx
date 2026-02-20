import { useTranslation } from 'react-i18next';
import { Layout } from '../../../shared/ui/Layout';
import { Mail, MessageCircle, ExternalLink } from 'lucide-react';

export function HelpPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-zinc-100">{t('help.title')}</h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">{t('help.needHelp')}</h2>
          <p className="text-zinc-400 leading-relaxed">
            {t('help.needHelpDesc')}
          </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">{t('help.contactSupport')}</h2>
          <div className="space-y-4">
            <a
              href="mailto:support@cloaka.io"
              className="flex items-center gap-3 p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Mail className="w-5 h-5 text-brand-400" />
              <div>
                <div className="text-zinc-200 font-medium">{t('help.emailSupport')}</div>
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
                <div className="text-zinc-200 font-medium">{t('help.telegram')}</div>
                <div className="text-zinc-400 text-sm">@cloaka_support</div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 ml-auto" />
            </a>
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">{t('help.faq')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-zinc-200 font-medium mb-2">{t('help.faq1q')}</h3>
              <p className="text-zinc-400 text-sm">{t('help.faq1a')}</p>
            </div>
            <div>
              <h3 className="text-zinc-200 font-medium mb-2">{t('help.faq2q')}</h3>
              <p className="text-zinc-400 text-sm">{t('help.faq2a')}</p>
            </div>
            <div>
              <h3 className="text-zinc-200 font-medium mb-2">{t('help.faq3q')}</h3>
              <p className="text-zinc-400 text-sm">{t('help.faq3a')}</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
