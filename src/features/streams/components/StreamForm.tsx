import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  CreateStreamDto,
  Stream,
  StreamModeSchema,
  StreamDetectorsOptionsDtoSchema,
} from '../../../shared/lib/zod-schemas';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { z } from 'zod';
import { Plus, X, HelpCircle } from 'lucide-react';

const StreamFormSchema = z.object({
  name: z.string().min(2).max(100),
  landingUrl: z.string().url(),
  whiteUrl: z.string().url(),
  mode: StreamModeSchema,
  detectorsOptions: StreamDetectorsOptionsDtoSchema.optional(),
  allowedGeos: z
    .array(z.string().length(2).toUpperCase())
    .max(50)
    .optional()
    .refine(
      (arr) => {
        if (!arr) return true;
        return new Set(arr).size === arr.length;
      },
      { message: 'Geo codes must be unique' }
    ),
  ipAllow: z
    .array(z.string())
    .max(20, 'Max 20 entries')
    .optional()
    .refine(
      (arr) => {
        if (!arr) return true;
        const normalized = arr.map((s) => s.trim().toLowerCase()).filter(Boolean);
        return new Set(normalized).size === normalized.length;
      },
      { message: 'IP allow list entries must be unique' }
    )
    .transform((v) => v ?? []),
  ipDeny: z
    .array(z.string())
    .max(20, 'Max 20 entries')
    .optional()
    .refine(
      (arr) => {
        if (!arr) return true;
        const normalized = arr.map((s) => s.trim().toLowerCase()).filter(Boolean);
        return new Set(normalized).size === normalized.length;
      },
      { message: 'IP deny list entries must be unique' }
    )
    .transform((v) => v ?? []),
});

type StreamFormData = z.infer<typeof StreamFormSchema>;
type StreamFormDataWithArrays = Omit<StreamFormData, 'ipAllow' | 'ipDeny'> & {
  ipAllow: string[];
  ipDeny: string[];
};

interface StreamFormProps {
  defaultValues?: Partial<Stream>;
  onSubmit: (data: CreateStreamDto) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

const DEFAULT_DETECTORS = {
  userAgent: true,
  screen: true,
  botsDatabase: true,
  vpnProxy: true,
};

export function StreamForm({ defaultValues, onSubmit, isLoading, submitLabel }: StreamFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<StreamFormDataWithArrays>({
    resolver: zodResolver(StreamFormSchema) as never,
    defaultValues: {
      name: defaultValues?.name || '',
      landingUrl: defaultValues?.landingUrl || '',
      whiteUrl: defaultValues?.whiteUrl || '',
      mode: defaultValues?.mode || 'redirect',
      detectorsOptions: defaultValues?.detectorsOptions || DEFAULT_DETECTORS,
      allowedGeos: defaultValues?.allowedGeos || [],
      ipAllow: defaultValues?.ipLists?.allow?.length ? defaultValues.ipLists.allow : [''],
      ipDeny: defaultValues?.ipLists?.deny?.length ? defaultValues.ipLists.deny : [''],
    },
  });

  const allowedGeos = watch('allowedGeos') || [];

  const {
    fields: allowFields,
    append: appendAllow,
    remove: removeAllow,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useFieldArray({ control, name: 'ipAllow' } as any);

  const {
    fields: denyFields,
    append: appendDeny,
    remove: removeDeny,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useFieldArray({ control, name: 'ipDeny' } as any);

  const addAllowRow = () => (appendAllow as (v: string) => void)('');
  const addDenyRow = () => (appendDeny as (v: string) => void)('');

  const handleFormSubmit = (data: StreamFormDataWithArrays) => {
    const normalizeIpList = (arr: string[] | undefined): string[] | null => {
      if (!Array.isArray(arr)) return null;
      const out = arr
        .map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
        .filter(Boolean);
      return out.length ? out : null;
    };
    const { ipAllow, ipDeny, ...rest } = data;
    const payload: CreateStreamDto = {
      ...rest,
      ipLists: {
        allow: normalizeIpList(ipAllow),
        deny: normalizeIpList(ipDeny),
      },
    };
    return onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label={t('streams.form.name')}
        placeholder={t('streams.form.namePlaceholder')}
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label={t('streams.form.offerUrl')}
        placeholder="https://example.com/offer"
        error={errors.landingUrl?.message}
        {...register('landingUrl')}
      />

      <Input
        label={t('streams.form.whiteUrl')}
        placeholder="https://example.com/white"
        error={errors.whiteUrl?.message}
        {...register('whiteUrl')}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">{t('common.mode')}</label>
        <select
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          {...register('mode')}
        >
          <option value="redirect">Redirect</option>
          <option value="fingerprint">Fingerprint</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-200">{t('streams.form.detectors')}</label>
        <div className="space-y-2">
          {[
            { key: 'userAgent', labelKey: 'streams.form.detectorUserAgent' },
            { key: 'screen', labelKey: 'streams.form.detectorScreen' },
            { key: 'botsDatabase', labelKey: 'streams.form.detectorBots' },
            { key: 'vpnProxy', labelKey: 'streams.form.detectorVpn' },
          ].map(({ key, labelKey }) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 bg-zinc-900 border-zinc-700 rounded text-brand-600 focus:ring-brand-500"
                {...register(`detectorsOptions.${key}` as const)}
              />
              <span className="text-sm text-zinc-300">{t(labelKey)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          {t('streams.form.allowedGeos')}
        </label>
        <Input
          placeholder={t('streams.form.allowedGeosPlaceholder')}
          error={errors.allowedGeos?.message}
          {...register('allowedGeos', {
            setValueAs: (v: unknown) => {
              if (Array.isArray(v)) return v.filter((code) => typeof code === 'string');
              if (typeof v === 'string') return v ? v.split(',').map((code) => code.trim().toUpperCase()) : [];
              return [];
            },
          })}
        />
        {allowedGeos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {allowedGeos.map((code) => (
              <span
                key={code}
                className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded border border-zinc-700"
              >
                {code}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-zinc-200">
              {t('streams.form.ipAllow')}
            </label>
            <span className="relative group">
              <HelpCircle
                className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help flex-shrink-0"
                aria-label={t('streams.form.ipAllowTooltip')}
              />
              <span
                role="tooltip"
                className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 w-72 p-3 text-xs text-zinc-200 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl pointer-events-none"
              >
                {t('streams.form.ipAllowTooltip')}
              </span>
            </span>
          </div>
          {errors.ipAllow?.message && (
            <p className="text-xs text-red-400 mb-2">{errors.ipAllow.message}</p>
          )}
          <div className="space-y-2">
            {allowFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder="192.168.1.1"
                  className="flex-1"
                  {...register(`ipAllow.${index}`)}
                />
                <button
                  type="button"
                  onClick={() => removeAllow(index)}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                  title={t('common.delete')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={addAllowRow}
              className="gap-2"
              disabled={allowFields.length >= 20}
            >
              <Plus className="w-4 h-4" />
              {t('streams.form.addIp')}
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-zinc-200">
              {t('streams.form.ipDeny')}
            </label>
            <span className="relative group">
              <HelpCircle
                className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help flex-shrink-0"
                aria-label={t('streams.form.ipDenyTooltip')}
              />
              <span
                role="tooltip"
                className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 w-72 p-3 text-xs text-zinc-200 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl pointer-events-none"
              >
                {t('streams.form.ipDenyTooltip')}
              </span>
            </span>
          </div>
          {errors.ipDeny?.message && (
            <p className="text-xs text-red-400 mb-2">{errors.ipDeny.message}</p>
          )}
          <div className="space-y-2">
            {denyFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder="192.168.1.1"
                  className="flex-1"
                  {...register(`ipDeny.${index}`)}
                />
                <button
                  type="button"
                  onClick={() => removeDeny(index)}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                  title={t('common.delete')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={addDenyRow}
              className="gap-2"
              disabled={denyFields.length >= 20}
            >
              <Plus className="w-4 h-4" />
              {t('streams.form.addIp')}
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('common.loading') : submitLabel}
      </Button>
    </form>
  );
}
