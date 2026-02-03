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
    it('should return help for undefined', () => {
      expect(getIconForMimeType(undefined)).toBe('help');
    });

    it('should return help for unknown vendor mime type', () => {
      expect(getIconForMimeType('application/vnd.something')).toBe('help');
    });

    it('should return image for image types', () => {
      expect(getIconForMimeType('image/jpeg')).toBe('image');
      expect(getIconForMimeType('image/gif')).toBe('image');
    });

    it('should return assignment for pdf', () => {
      expect(getIconForMimeType('application/pdf')).toBe('assignment');
    });

    it('should return code_blocks for json and xml', () => {
      expect(getIconForMimeType('application/json')).toBe('code_blocks');
      expect(getIconForMimeType('application/xml')).toBe('code_blocks');
      expect(getIconForMimeType('text/xml')).toBe('code_blocks');
    });

    it('should return code_blocks for vendor specific siren+json', () => {
      expect(getIconForMimeType('application/vnd.siren+json')).toBe('code_blocks');
    });

    it('should return description for text/plain', () => {
      expect(getIconForMimeType('text/plain')).toBe('description');
    });

    it('should return description for unknown text types', () => {
      expect(getIconForMimeType('text/unknown')).toBe('description');
    });

    it('should return box for zip', () => {
      expect(getIconForMimeType('application/zip')).toBe('box');
    });

    it('should return memory for application/octet-stream', () => {
      expect(getIconForMimeType('application/octet-stream')).toBe('memory');
    });

    it('should return file_present for unknown application types', () => {
      expect(getIconForMimeType('application/unknown')).toBe('file_present');
    });
  });
});
