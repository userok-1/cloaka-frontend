import { useForm } from 'react-hook-form';
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
import { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';

function isValidIpCidr(value: string): boolean {
  const s = value.trim().toLowerCase();
  if (!s) return false;
  const [ipPart, cidrPart] = s.split('/');
  if (!ipPart) return false;
  const octets = ipPart.split('.');
  if (octets.length !== 4) return false;
  const octetOk = (o: string) => {
    const n = parseInt(o, 10);
    return o !== '' && !isNaN(n) && n >= 0 && n <= 255;
  };
  if (!octets.every(octetOk)) return false;
  if (cidrPart !== undefined) {
    const n = parseInt(cidrPart, 10);
    if (cidrPart === '' || isNaN(n) || n < 0 || n > 32) return false;
  }
  return true;
}

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

function normalizeIp(value: string): string {
  let s = value.trim().toLowerCase();
  if (s.endsWith('/32')) {
    s = s.slice(0, -3);
  }
  return s;
}

function IpChipField({
  values,
  onAdd,
  onRemove,
  onReplace,
  getError,
  placeholder,
  duplicateTooltip,
  removeTitle,
  maxCount,
  validateValue,
}: {
  values: string[];
  onAdd: (raw: string) => void;
  onRemove: (index: number) => void;
  onReplace: (index: number, newValue: string) => void;
  getError: (index: number) => string | undefined;
  placeholder: string;
  duplicateTooltip: string;
  removeTitle: string;
  maxCount: number;
  validateValue: (raw: string) => boolean;
}) {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editInputValue, setEditInputValue] = useState('');

  const commit = (raw: string) => {
    const parts = raw.split(/[,\n]+/).map((p) => p.trim().toLowerCase()).filter(Boolean);
    parts.forEach((p) => onAdd(p));
    setInputValue('');
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditInputValue(values[index] ?? '');
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    const v = editInputValue.trim().toLowerCase();
    if (!v) {
      onRemove(editingIndex);
    } else if (validateValue(v)) {
      onReplace(editingIndex, v);
    } else {
      onReplace(editingIndex, values[editingIndex] ?? '');
    }
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    if (editingIndex !== null) {
      onReplace(editingIndex, values[editingIndex] ?? '');
    }
    setEditingIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(inputValue);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').trim();
    if (text) {
      e.preventDefault();
      commit(text);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v.includes(',') || v.includes('\n')) {
      commit(v);
      return;
    }
    setInputValue(v);
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-zinc-900 border border-zinc-700 rounded-lg min-h-[42px] transition-colors hover:border-brand-500 focus-within:border-brand-500">
      {values.map((value, index) => {
        const err = getError(index);
        const isEditing = editingIndex === index;
        if (isEditing) {
          const inputWidth = Math.max(editInputValue.length, 8);
          return (
            <span
              key={`edit-${index}`}
              className="inline-flex items-center rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5"
            >
              <input
                type="text"
                value={editInputValue}
                onChange={(e) => setEditInputValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={commitEdit}
                autoFocus
                maxLength={30}
                style={{ width: `${inputWidth}ch` }}
                className="min-w-0 bg-transparent py-0.5 text-sm text-zinc-100 focus:outline-none"
              />
            </span>
          );
        }
        return (
          <span
            key={`${value}-${index}`}
            role="button"
            tabIndex={0}
            onClick={() => startEdit(index)}
            onKeyDown={(e) => e.key === 'Enter' && startEdit(index)}
            className={`relative group inline-flex items-center gap-1 px-2 py-1 rounded border text-sm cursor-text ${
              err ? 'border-red-500 bg-red-950/30 text-zinc-200' : 'border-zinc-600 bg-zinc-800 text-zinc-200'
            }`}
          >
            {value}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="p-0.5 text-zinc-400 hover:text-zinc-100 rounded"
              title={removeTitle}
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {err && (
              <span
                role="tooltip"
                className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 w-48 p-2 text-xs text-zinc-200 bg-zinc-800 border border-zinc-600 rounded shadow-xl pointer-events-none"
              >
                {duplicateTooltip}
              </span>
            )}
          </span>
        );
      })}
      {values.length < maxCount && (
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] px-2 py-1 bg-transparent border-0 rounded text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
        />
      )}
    </div>
  );
}

function useIpDuplicateValidation(
  ipAllow: string[],
  ipDeny: string[],
  errorMessage: string
): {
  getAllowError: (index: number) => string | undefined;
  getDenyError: (index: number) => string | undefined;
} {
  const allowNorm = ipAllow.map(normalizeIp);
  const denyNorm = ipDeny.map(normalizeIp);
  const allowSet = new Set(allowNorm.filter(Boolean));
  const denySet = new Set(denyNorm.filter(Boolean));
  const allowCount = new Map<string, number>();
  const denyCount = new Map<string, number>();
  for (const v of allowNorm) {
    if (v === '') continue;
    allowCount.set(v, (allowCount.get(v) ?? 0) + 1);
  }
  for (const v of denyNorm) {
    if (v === '') continue;
    denyCount.set(v, (denyCount.get(v) ?? 0) + 1);
  }
  const allowDuplicated = new Set<string>([...allowCount.entries()].filter(([, n]) => n > 1).map(([k]) => k));
  const denyDuplicated = new Set<string>([...denyCount.entries()].filter(([, n]) => n > 1).map(([k]) => k));
  const crossDuplicated = new Set<string>([...allowSet].filter((v) => denySet.has(v)));

  const getAllowError = (index: number): string | undefined => {
    const v = allowNorm[index];
    if (v === '') return undefined;
    return allowDuplicated.has(v) || crossDuplicated.has(v) ? errorMessage : undefined;
  };
  const getDenyError = (index: number): string | undefined => {
    const v = denyNorm[index];
    if (v === '') return undefined;
    return denyDuplicated.has(v) || crossDuplicated.has(v) ? errorMessage : undefined;
  };
  return { getAllowError, getDenyError };
}

export function StreamForm({ defaultValues, onSubmit, isLoading, submitLabel }: StreamFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<StreamFormDataWithArrays>({
    resolver: zodResolver(StreamFormSchema) as never,
    defaultValues: {
      name: defaultValues?.name || '',
      landingUrl: defaultValues?.landingUrl || '',
      whiteUrl: defaultValues?.whiteUrl || '',
      mode: defaultValues?.mode || 'redirect',
      detectorsOptions: defaultValues?.detectorsOptions || DEFAULT_DETECTORS,
      allowedGeos: defaultValues?.allowedGeos || [],
      ipAllow: defaultValues?.ipLists?.allow ?? [],
      ipDeny: defaultValues?.ipLists?.deny ?? [],
    },
  });

  const allowedGeos = watch('allowedGeos') || [];
  const ipAllow = watch('ipAllow') ?? [];
  const ipDeny = watch('ipDeny') ?? [];
  const { getAllowError, getDenyError } = useIpDuplicateValidation(
    ipAllow,
    ipDeny,
    t('streams.form.ipDuplicateError')
  );

  const setAllow = (arr: string[]) => setValue('ipAllow', arr);
  const setDeny = (arr: string[]) => setValue('ipDeny', arr);
  const addIpAllow = (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v || !isValidIpCidr(v)) return;
    if ((watch('ipAllow') ?? []).length >= 20) return;
    setAllow([...(watch('ipAllow') ?? []), v]);
  };
  const addIpDeny = (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v || !isValidIpCidr(v)) return;
    if ((watch('ipDeny') ?? []).length >= 20) return;
    setDeny([...(watch('ipDeny') ?? []), v]);
  };
  const removeIpAllow = (index: number) => {
    const arr = (watch('ipAllow') ?? []).slice();
    arr.splice(index, 1);
    setAllow(arr);
  };
  const removeIpDeny = (index: number) => {
    const arr = (watch('ipDeny') ?? []).slice();
    arr.splice(index, 1);
    setDeny(arr);
  };
  const replaceIpAllow = (index: number, newValue: string) => {
    const arr = (watch('ipAllow') ?? []).slice();
    arr[index] = newValue;
    setAllow(arr);
  };
  const replaceIpDeny = (index: number, newValue: string) => {
    const arr = (watch('ipDeny') ?? []).slice();
    arr[index] = newValue;
    setDeny(arr);
  };
  const clearIpAllow = () => setAllow([]);
  const clearIpDeny = () => setDeny([]);

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
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors"
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
                className="w-4 h-4 bg-zinc-900 border-zinc-700 rounded text-brand-600 focus:ring-brand-500 hover:ring-2 hover:ring-brand-500 transition-all"
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
          <IpChipField
            values={ipAllow}
            onAdd={addIpAllow}
            onRemove={removeIpAllow}
            onReplace={replaceIpAllow}
            getError={getAllowError}
            placeholder="192.168.1.1"
            duplicateTooltip={t('streams.form.ipDuplicateError')}
            removeTitle={t('common.delete')}
            maxCount={20}
            validateValue={isValidIpCidr}
          />
          {ipAllow.length >= 1 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={clearIpAllow}
                className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 rounded border border-zinc-600 hover:border-zinc-500 transition-colors"
              >
                {t('common.clearAll')}
              </button>
            </div>
          )}
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
          <IpChipField
            values={ipDeny}
            onAdd={addIpDeny}
            onRemove={removeIpDeny}
            onReplace={replaceIpDeny}
            getError={getDenyError}
            placeholder="192.168.1.1"
            duplicateTooltip={t('streams.form.ipDuplicateError')}
            removeTitle={t('common.delete')}
            maxCount={20}
            validateValue={isValidIpCidr}
          />
          {ipDeny.length >= 1 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={clearIpDeny}
                className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 rounded border border-zinc-600 hover:border-zinc-500 transition-colors"
              >
                {t('common.clearAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('common.loading') : submitLabel}
      </Button>
    </form>
  );
}
