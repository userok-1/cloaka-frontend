import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateStreamDto, CreateStreamDtoSchema, Stream } from '../../../shared/lib/zod-schemas';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

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
  } = useForm<CreateStreamDto>({
    resolver: zodResolver(CreateStreamDtoSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      landingUrl: defaultValues?.landingUrl || '',
      whiteUrl: defaultValues?.whiteUrl || '',
      mode: defaultValues?.mode || 'redirect',
      detectorsOptions: defaultValues?.detectorsOptions || DEFAULT_DETECTORS,
      allowedGeos: defaultValues?.allowedGeos || [],
    },
  });

  const allowedGeos = watch('allowedGeos') || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Stream Name"
        placeholder="My Campaign"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Landing URL"
        placeholder="https://example.com/landing"
        error={errors.landingUrl?.message}
        {...register('landingUrl')}
      />

      <Input
        label="White URL"
        placeholder="https://example.com/safe"
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
            setValueAs: (v: string) =>
              v ? v.split(',').map((code) => code.trim().toUpperCase()) : [],
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
