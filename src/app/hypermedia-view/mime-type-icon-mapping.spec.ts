import { getBaseMimeType, getIconForMimeType } from './mime-type-icon-mapping';

describe('mime-type-icon-mapping', () => {
  describe('getBaseMimeType', () => {
    it('should return undefined for undefined or empty input', () => {
      expect(getBaseMimeType(undefined as any)).toBeUndefined();
      expect(getBaseMimeType('')).toBeUndefined();
    });

    it('should return the same mime type for standard types', () => {
      expect(getBaseMimeType('application/json')).toBe('application/json');
      expect(getBaseMimeType('image/png')).toBe('image/png');
    });

    it('should fall back to json for application/vnd.siren+json', () => {
      expect(getBaseMimeType('application/vnd.siren+json')).toBe('application/json');
    });

    it('should fall back to xml for application/vnd.something+xml', () => {
      expect(getBaseMimeType('application/vnd.something+xml')).toBe('application/xml');
    });

    it('should fall back to application/suffix for other application/vnd.+suffix', () => {
      expect(getBaseMimeType('application/vnd.company.category+custom')).toBe('application/custom');
    });

    it('should return undefined if vendor-specific type cannot be determined', () => {
      // It only detects application/vnd.something+suffix
      expect(getBaseMimeType('application/vnd.something')).toBeUndefined();
    });
  });

  describe('getIconForMimeType', () => {
    it('should return help_outline for undefined', () => {
      expect(getIconForMimeType(undefined)).toBe('help_outline');
    });

    it('should return help_outline for unknown vendor mime type', () => {
      expect(getIconForMimeType('application/vnd.something')).toBe('help_outline');
    });

    it('should return image for image types', () => {
      expect(getIconForMimeType('image/jpeg')).toBe('image');
      expect(getIconForMimeType('image/gif')).toBe('image');
    });

    it('should return picture_as_pdf for pdf', () => {
      expect(getIconForMimeType('application/pdf')).toBe('picture_as_pdf');
    });

    it('should return code for json and xml', () => {
      expect(getIconForMimeType('application/json')).toBe('code');
      expect(getIconForMimeType('application/xml')).toBe('code');
      expect(getIconForMimeType('text/xml')).toBe('code');
    });

    it('should return code for vendor specific siren+json', () => {
      expect(getIconForMimeType('application/vnd.siren+json')).toBe('code');
    });

    it('should return description for text/plain', () => {
      expect(getIconForMimeType('text/plain')).toBe('description');
    });

    it('should return description for unknown text types', () => {
      expect(getIconForMimeType('text/unknown')).toBe('description');
    });

    it('should return inventory_2 for zip', () => {
      expect(getIconForMimeType('application/zip')).toBe('inventory_2');
    });

    it('should return file_present for application/octet-stream', () => {
      expect(getIconForMimeType('application/octet-stream')).toBe('file_present');
    });

    it('should return help_outline for unknown application types', () => {
      expect(getIconForMimeType('application/unknown')).toBe('help_outline');
    });
  });
});
