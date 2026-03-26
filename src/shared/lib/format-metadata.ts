/**
 * Renders log metadata for display: pretty-prints objects and JSON strings.
 */
export function formatMetadataForDisplay(metadata: unknown): string {
  if (metadata === null || metadata === undefined) return '';

  if (typeof metadata === 'object') {
    return JSON.stringify(metadata, null, 2);
  }

  if (typeof metadata === 'string') {
    const trimmed = metadata.trim();
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return JSON.stringify(JSON.parse(trimmed), null, 2);
      } catch {
        return metadata;
      }
    }
    return metadata;
  }

  return String(metadata);
}
