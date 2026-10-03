import { addHeader, addSite, globalHeaderTarget, removeHeader, setHeaderHidden, siteHeaderTarget, updateHeader } from './appsettings.actions';
import { appSettingsReducer, initialState } from './appsettings.reducer';

describe('appSettingsReducer headers', () => {
  const site = 'api.example.com';
  const withSite = appSettingsReducer(initialState, addSite({ siteUrl: site }));

  it('adds, updates and removes global headers without touching sites', () => {
    let state = appSettingsReducer(withSite, addHeader({ target: globalHeaderTarget, key: 'X-Key', value: '1', hidden: true }));
    state = appSettingsReducer(state, updateHeader({ target: globalHeaderTarget, previousKey: 'X-Key', newKey: 'X-Other', newValue: '2' }));

    // renaming keeps the hidden state
    expect(state.siteSettings.globalSiteSettings.headers.toJS()).toEqual({ 'X-Other': { value: '2', hidden: true } });
    expect(state.siteSettings.siteSpecificSettings.get(site)!.headers.size).toBe(0);

    state = appSettingsReducer(state, removeHeader({ target: globalHeaderTarget, key: 'X-Other' }));
    expect(state.siteSettings.globalSiteSettings.headers.size).toBe(0);
  });

  it('adds site headers only to that site', () => {
    const state = appSettingsReducer(withSite, addHeader({ target: siteHeaderTarget(site), key: 'X-Key', value: '1', hidden: false }));

    expect(state.siteSettings.siteSpecificSettings.get(site)!.headers.toJS()).toEqual({ 'X-Key': { value: '1', hidden: false } });
    expect(state.siteSettings.globalSiteSettings.headers.size).toBe(0);
  });

  it('hides and shows a header value', () => {
    let state = appSettingsReducer(withSite, addHeader({ target: siteHeaderTarget(site), key: 'X-Key', value: '1', hidden: false }));
    state = appSettingsReducer(state, setHeaderHidden({ target: siteHeaderTarget(site), key: 'X-Key', hidden: true }));
    expect(state.siteSettings.siteSpecificSettings.get(site)!.headers.get('X-Key')!.hidden).toBeTrue();

    state = appSettingsReducer(state, setHeaderHidden({ target: siteHeaderTarget(site), key: 'X-Key', hidden: false }));
    expect(state.siteSettings.siteSpecificSettings.get(site)!.headers.get('X-Key')!.hidden).toBeFalse();
  });

  it('rejects headers for an unknown site', () => {
    expect(() => appSettingsReducer(withSite, addHeader({ target: siteHeaderTarget('unknown.example.com'), key: 'X-Key', value: '1', hidden: false })))
      .toThrowError('site url not present');
  });
});
