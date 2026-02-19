import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateStreamDto,
  Stream,
  StreamModeSchema,
  StreamDetectorsOptionsDtoSchema,
} from '../../../shared/lib/zod-schemas';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

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
  // Match backend StreamIpListsDto: max 20, unique (after trim + lowercase)
  ipWhitelist: z
    .array(z.string())
    .max(20, 'Max 20 entries')
    .optional()
    .refine(
      (arr) => {
        if (!arr) return true;
        const normalized = arr.map((s) => s.trim().toLowerCase()).filter(Boolean);
        return new Set(normalized).size === normalized.length;
      },
      { message: 'IP whitelist entries must be unique' }
    )
    .transform((v) => v ?? []),
  ipBlacklist: z
    .array(z.string())
    .max(20, 'Max 20 entries')
    .optional()
    .refine(
      (arr) => {
        if (!arr) return true;
        const normalized = arr.map((s) => s.trim().toLowerCase()).filter(Boolean);
        return new Set(normalized).size === normalized.length;
      },
      { message: 'IP blacklist entries must be unique' }
    )
    .transform((v) => v ?? []),
});

type StreamFormData = z.infer<typeof StreamFormSchema>;
type StreamFormDataWithArrays = Omit<StreamFormData, 'ipWhitelist' | 'ipBlacklist'> & {
  ipWhitelist: string[];
  ipBlacklist: string[];
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
      ipWhitelist:
        defaultValues?.ipLists?.ipWhitelist?.length ?? defaultValues?.ipWhitelist?.length
          ? (defaultValues?.ipLists?.ipWhitelist ?? defaultValues?.ipWhitelist ?? [])
          : [''],
      ipBlacklist:
        defaultValues?.ipLists?.ipBlacklist?.length ?? defaultValues?.ipBlacklist?.length
          ? (defaultValues?.ipLists?.ipBlacklist ?? defaultValues?.ipBlacklist ?? [])
          : [''],
    },
  });

  const allowedGeos = watch('allowedGeos') || [];

  const {
    fields: whitelistFields,
    append: appendWhitelist,
    remove: removeWhitelist,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useFieldArray name inference with optional schema fields
  } = useFieldArray({ control, name: 'ipWhitelist' } as any);

  const {
    fields: blacklistFields,
    append: appendBlacklist,
    remove: removeBlacklist,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useFieldArray name inference with optional schema fields
  } = useFieldArray({ control, name: 'ipBlacklist' } as any);

  const addWhitelistRow = () => (appendWhitelist as (v: string) => void)('');
  const addBlacklistRow = () => (appendBlacklist as (v: string) => void)('');

  const handleFormSubmit = (data: StreamFormDataWithArrays) => {
    // Normalize like backend StreamIpListsDto: trim, lowercase, filter empty, null if empty
    const normalizeIpList = (arr: string[] | undefined): string[] | null => {
      if (!Array.isArray(arr)) return null;
      const out = arr
        .map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
        .filter(Boolean);
      return out.length ? out : null;
    };
    const { ipWhitelist: w, ipBlacklist: b, ...rest } = data;
    const payload: CreateStreamDto = {
      ...rest,
      ipLists: {
        ipWhitelist: normalizeIpList(w),
        ipBlacklist: normalizeIpList(b),
      },
    };
    return onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Stream Name"
        placeholder="My Campaign"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Offer URL"
        placeholder="https://example.com/offer"
        error={errors.landingUrl?.message}
        {...register('landingUrl')}
      />

      <Input
        label="White URL"
        placeholder="https://example.com/white"
        error={errors.whiteUrl?.message}
        {...register('whiteUrl')}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">Mode</label>
        <select
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          {...register('mode')}
        >
          <option value="redirect">Redirect</option>
          <option value="fingerprint">Fingerprint</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-200">Detector Options</label>
        <div className="space-y-2">
          {[
            { key: 'userAgent', label: 'User Agent Detection' },
            { key: 'screen', label: 'Screen Detection' },
            { key: 'botsDatabase', label: 'Bots Database' },
            { key: 'vpnProxy', label: 'VPN/Proxy Detection' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 bg-zinc-900 border-zinc-700 rounded text-violet-600 focus:ring-violet-500"
                {...register(`detectorsOptions.${key}` as const)}
              />
              <span className="text-sm text-zinc-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Allowed Geos (ISO-2 codes)
        </label>
        <Input
          placeholder="US,GB,CA (comma-separated, uppercase)"
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
          <label className="block text-sm font-medium text-zinc-200 mb-2">
            IP Whitelist
          </label>
          <p className="text-xs text-zinc-500 mb-2">
            IP or CIDR (e.g. 192.168.1.1 or 10.0.0.0/8). Max 20 entries, unique.
          </p>
          {errors.ipWhitelist?.message && (
            <p className="text-xs text-red-400 mb-2">{errors.ipWhitelist.message}</p>
          )}
          <div className="space-y-2">
            {whitelistFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. 192.168.1.1 or 10.0.0.0/8"
                  className="flex-1"
                  {...register(`ipWhitelist.${index}`)}
                />
                <button
                  type="button"
                  onClick={() => removeWhitelist(index)}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={addWhitelistRow}
              className="gap-2"
              disabled={whitelistFields.length >= 20}
            >
              <Plus className="w-4 h-4" />
              Add IP or network
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-200 mb-2">
            IP Blacklist
          </label>
          <p className="text-xs text-zinc-500 mb-2">
            IP or CIDR to block. Max 20 entries, unique.
          </p>
          {errors.ipBlacklist?.message && (
            <p className="text-xs text-red-400 mb-2">{errors.ipBlacklist.message}</p>
          )}
          <div className="space-y-2">
            {blacklistFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. 192.168.1.1 or 10.0.0.0/8"
                  className="flex-1"
                  {...register(`ipBlacklist.${index}`)}
                />
                <button
                  type="button"
                  onClick={() => removeBlacklist(index)}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={addBlacklistRow}
              className="gap-2"
              disabled={blacklistFields.length >= 20}
            >
              <Plus className="w-4 h-4" />
              Add IP or network
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
