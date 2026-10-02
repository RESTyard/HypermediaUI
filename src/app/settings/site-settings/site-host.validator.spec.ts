import { siteHostError } from './site-host.validator';

describe('siteHostError', () => {
  it('accepts host names, ports and IP addresses', () => {
    for (const host of ['api.example.com', 'localhost:5000', 'API.Example.com', '127.0.0.1:8080', '[::1]:8080']) {
      expect(siteHostError(host)).withContext(host).toBeNull();
    }
  });

  it('requires a host', () => {
    expect(siteHostError(' ')).toContain('Enter a host');
  });

  it('rejects a scheme and suggests the host', () => {
    expect(siteHostError('https://api.example.com')).toBe('Enter the host without scheme: api.example.com');
    expect(siteHostError('http://localhost:5000/api')).toBe('Enter the host without scheme: localhost:5000');
  });

  it('rejects a path, query or fragment', () => {
    expect(siteHostError('api.example.com/entrypoint')).toBe('Enter the host without path, query or fragment: api.example.com');
    expect(siteHostError('api.example.com?a=1')).toContain('without path');
    expect(siteHostError('api.example.com#top')).toContain('without path');
  });

  it('rejects invalid hosts', () => {
    for (const host of ['user@api.example.com', 'api example.com', 'localhost:99999', 'localhost:abc']) {
      expect(siteHostError(host)).withContext(host).toContain('Not a valid host');
    }
  });

  it('rejects hosts that requests address differently', () => {
    expect(siteHostError('localhost:80')).toBe('Requests address this host as localhost');
    expect(siteHostError('bücher.de')).toBe('Requests address this host as xn--bcher-kva.de');
  });

  it('rejects a host that already has settings', () => {
    expect(siteHostError('API.example.com', ['other.com', 'api.example.com'])).toBe('Settings for this host already exist');
  });
});
