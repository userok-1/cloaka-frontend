# How to Extend Detector Options

This project is designed to easily support new detector options without major refactoring.

## Adding a New Detector Option

To add a new detector option (e.g., `geolocation`), follow these steps:

### 1. Update Zod Schema (Optional - Schema Already Extensible)

The schema in `src/shared/lib/zod-schemas.ts` already uses `.catchall(z.boolean())` which automatically accepts any additional boolean fields:

```typescript
export const StreamDetectorsOptionsDtoSchema = z
  .object({
    userAgent: z.boolean().optional(),
    screen: z.boolean().optional(),
    botsDatabase: z.boolean().optional(),
    vpnProxy: z.boolean().optional(),
  })
  .catchall(z.boolean()); // ✅ This allows any additional boolean fields
```

This means the backend can accept new detector options without frontend changes!

### 2. Update the Form (Add UI Control)

In `src/features/streams/components/StreamForm.tsx`, add the new option to the detector options array:

```typescript
{[
  { key: 'userAgent', label: 'User Agent Detection' },
  { key: 'screen', label: 'Screen Detection' },
  { key: 'botsDatabase', label: 'Bots Database' },
  { key: 'vpnProxy', label: 'VPN/Proxy Detection' },
  { key: 'geolocation', label: 'Geolocation Check' }, // ✅ Add this line
].map(({ key, label }) => (
  // ... checkbox rendering
))}
```

### 3. Update Default Values (Optional)

If you want the new option to be enabled by default, update the `DEFAULT_DETECTORS` constant:

```typescript
const DEFAULT_DETECTORS = {
  userAgent: true,
  screen: true,
  botsDatabase: true,
  vpnProxy: true,
  geolocation: true, // ✅ Add default
};
```

## Dynamic Detector Options (Advanced)

For a fully dynamic approach where detector options are configured from the backend:

1. Create an API endpoint that returns available detector options
2. Fetch this list when rendering the form
3. Dynamically generate checkboxes based on the API response

Example:

```typescript
const { data: availableDetectors } = useQuery({
  queryKey: ['detector-options'],
  queryFn: () => detectorsApi.getAvailable(),
});

// Render checkboxes dynamically
{availableDetectors?.map((detector) => (
  <label key={detector.key}>
    <input type="checkbox" {...register(`detectorsOptions.${detector.key}`)} />
    <span>{detector.label}</span>
  </label>
))}
```

This approach requires zero frontend changes when adding new detector options on the backend.
