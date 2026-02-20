import { useTranslation } from 'react-i18next';
import { Layout } from '../../../shared/ui/Layout';

export function DocsPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-zinc-100">{t('docs.title')}</h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">{t('docs.aboutTitle')}</h2>
          <p className="text-zinc-400 leading-relaxed">
            {t('docs.aboutDesc')}
          </p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">{t('docs.keyFeatures')}</h2>
          <ul className="space-y-3 text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">{t('docs.featureStreams')}</strong> - {t('docs.featureStreamsDesc')}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">{t('docs.featureBotDetection')}</strong> - {t('docs.featureBotDetectionDesc')}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">{t('docs.featureGeo')}</strong> - {t('docs.featureGeoDesc')}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">{t('docs.featureVpn')}</strong> - {t('docs.featureVpnDesc')}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-400 mt-1">•</span>
              <div>
                <strong className="text-zinc-200">{t('docs.featureLogs')}</strong> - {t('docs.featureLogsDesc')}
              </div>
            </li>
          </ul>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">{t('docs.streamModes')}</h2>
          <div className="space-y-3 text-zinc-400">
            <div>
              <strong className="text-zinc-200">{t('docs.redirectMode')}</strong> - {t('docs.redirectModeDesc')}
            </div>
            <div>
              <strong className="text-zinc-200">{t('docs.fingerprintMode')}</strong> - {t('docs.fingerprintModeDesc')}
            </div>
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">{t('docs.gettingStarted')}</h2>
          <ol className="space-y-3 text-zinc-400 list-decimal list-inside">
            <li>{t('docs.step1')}</li>
            <li>{t('docs.step2')}</li>
            <li>{t('docs.step3')}</li>
            <li>{t('docs.step4')}</li>
            <li>{t('docs.step5')}</li>
            <li>{t('docs.step6')}</li>
          </ol>
        </section>
      </div>
    </Layout>
  );
}
