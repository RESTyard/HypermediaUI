import { Record, Map } from 'immutable'

export class Test extends Record({num: 1, other: false}) {}

export class GeneralSettings extends Record({
    showRawTab: true,
    showClasses: false,
    showEmptyEntities: false,
    showEmptyProperties: false,
    showNullProperties: true,
    showEmptyLinks: false,
    showEmptyActions: false,
    showEmbeddedEntityTitles: true,
    showActionNames: true,
    autoFollowActionLocationOnSuccess: false,
    useEmbeddingPropertyForActionParameters: true,
    showHostInformation: true,
    showPropertyTreeControls: true,
    actionExecutionTimeoutMs: 60000
}) {}

export class SiteSetting extends Record({
    siteUrl: "",
    headers: Map<string, string>(),
}) {}

export class SiteSettings extends Record({
    globalSiteSettings: new SiteSetting(),
    siteSpecificSettings: Map<string, SiteSetting>()
}) {}

export class AppSettings extends Record({
    generalSettings: new GeneralSettings(),
    siteSettings: new SiteSettings(),
}) {}
