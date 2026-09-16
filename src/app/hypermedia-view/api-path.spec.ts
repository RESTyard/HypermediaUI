import { ApiPath } from './api-path';

describe('ApiPath', () => {
  it('initializes a path from a single or repeated query parameter', () => {
    const path = new ApiPath();
    path.initFromRouterParams({ apiPath: 'https://api.test/entrypoint' });
    expect(path.fullPath).toEqual(['https://api.test/entrypoint']);

    path.initFromRouterParams({ apiPath: ['https://api.test/entrypoint', 'https://api.test/customers/42'] });
    expect(path.fullPath).toEqual(['https://api.test/entrypoint', 'https://api.test/customers/42']);
  });

  it('removes obsolete forward history when revisiting a known path', () => {
    const path = new ApiPath(['entrypoint', 'customers', 'orders']);
    path.setCurrentStep('customers');

    expect(path.fullPath).toEqual(['entrypoint', 'customers']);
    expect(path.newestSegment).toBe('customers');
  });

  it('returns a defensive copy of the path', () => {
    const path = new ApiPath(['entrypoint']);
    const copy = path.fullPath;
    copy.push('mutated');

    expect(path.fullPath).toEqual(['entrypoint']);
  });
});
