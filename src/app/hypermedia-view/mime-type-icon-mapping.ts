export const mimeTypeIconMapping: { [key: string]: string } = {
  // Images
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/gif': 'image',

  // Audio
  'audio/mpeg': 'brand_awareness',
  'audio/wav': 'brand_awareness',
  'audio/ogg': 'brand_awareness',
  'audio/midi': 'brand_awareness',
  'audio/x-midi': 'brand_awareness',
  'audio/webm': 'brand_awareness',
  'audio/aac': 'brand_awareness',
  'audio/flac': 'brand_awareness',

  // Video
  'video/mp4': 'videocam',
  'video/mpeg': 'videocam',
  'video/ogg': 'videocam',
  'video/quicktime': 'videocam',
  'video/webm': 'videocam',
  'video/x-msvideo': 'videocam', // .avi
  'video/x-matroska': 'videocam', // .mkv

  // Documents
  'application/pdf': 'assignment',
  'text/plain': 'description',
  'text/csv': 'table_view',
  'text/markdown': 'edit_note',

  // Code & Web
  'application/json': 'data_object',
  'application/xml': 'code',
  'text/xml': 'code',
  'text/html': 'html',
  'text/toml': 'settings',
  'text/yaml': 'settings',

  // Archives
  'application/zip': 'folder_zip',
  'application/x-zip-compressed': 'folder_zip',

  // Binary / Other
  'application/octet-stream': 'memory',
};

/**
 * Finds the base mime type for vendor-specific mime types.
 * For example: application/vnd.siren+json -> application/json
 * @param mimeType The mime type to check.
 */
export function getBaseMimeType(mimeType: string): string | undefined {
  if (!mimeType) {
    return undefined;
  }

  // Check if it's a vendor-specific type (e.g., application/vnd.something)
  if (mimeType.startsWith('application/vnd.')) {
    // Check for a suffix (e.g., +json, +xml)
    const vendorMatch = mimeType.match(/^application\/vnd\..+\+(.+)$/);
    if (vendorMatch && vendorMatch[1]) {
      const suffix = vendorMatch[1];
      if (suffix === 'json') {
        return 'application/json';
      }
      if (suffix === 'xml') {
        return 'application/xml';
      }
      // Fallback to application/suffix if it's a known format but not application/
      return `application/${suffix}`;
    }

    // If it's application/vnd. but we can't determine the base type, return undefined
    return undefined;
  }

  return mimeType;
}

/**
 * Returns an icon name for a given mime type.
 * @param mimeType The mime type to get an icon for.
 */
export function getIconForMimeType(mimeType: string | undefined): string {
  if (!mimeType) {
    return 'insert_drive_file';
  }

  const baseMimeType = getBaseMimeType(mimeType);

  if (!baseMimeType) {
    return 'insert_drive_file';
  }

  const normalizedBaseMimeType = baseMimeType.toLowerCase();

  if (mimeTypeIconMapping[normalizedBaseMimeType]) {
    return mimeTypeIconMapping[normalizedBaseMimeType];
  }

  // Generic fallbacks
  if (normalizedBaseMimeType.startsWith('image/')) {
    return 'image';
  }
  if (normalizedBaseMimeType.startsWith('audio/')) {
    return 'brand_awareness';
  }
  if (normalizedBaseMimeType.startsWith('video/')) {
    return 'video_file';
  }
  if (normalizedBaseMimeType.startsWith('text/')) {
    return 'description';
  }

  return 'insert_drive_file';
}
