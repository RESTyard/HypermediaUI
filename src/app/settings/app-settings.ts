import { Record, Map } from 'immutable'
import { defaultSearchOptions, SearchOptions } from '../hypermedia-view/search/entity-search';

export class Test extends Record({num: 1, other: false}) {}

export class GeneralSettings extends Record({
    showRawTab: true,
    showClasses: false,
    showEmptyEntities: false,
    showEmptyProperties: false,
    showNullProperties: true,
    showEmptyLinks: false,
    showEmptyActions: false,
    showLinkDropdown: true,
    autoFollowActionLocationOnSuccess: false,
    useEmbeddingPropertyForActionParameters: true,
    showHostInformation: true,
    showPropertyTreeControls: true,
    showSearch: true,
    searchOptions: defaultSearchOptions as SearchOptions,
    actionExecutionTimeoutMs: 60000
}) {}

/** hidden masks the value in the settings, e.g. while screen sharing; it is no protection of the stored value */
export class HeaderSetting extends Record({
    value: "",
    hidden: false,
}) {}

export class SiteSetting extends Record({
    siteUrl: "",
    headers: Map<string, HeaderSetting>(),
}) {}

export class SiteSettings extends Record({
    globalSiteSettings: new SiteSetting(),
    siteSpecificSettings: Map<string, SiteSetting>()
}) {}

export class AppSettings extends Record({
    generalSettings: new GeneralSettings(),
    siteSettings: new SiteSettings(),
}) {}
