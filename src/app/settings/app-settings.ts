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
    useEmbeddingPropertyForActionParameters: true,
    showHostInformation: true,
    actionExecutionTimeoutMs: 60000
}) {}

export class AuthenticationConfiguration extends Record({
  authority: "",
  client_id: "",
  redirect_uri: "",
  scope: "",
}) {}

export class SiteSetting extends Record({
    siteUrl: "",
    headers: Map<string, string>(),
    authConfig: <AuthenticationConfiguration | undefined> undefined
}) {}

export class SiteSettings extends Record({
    globalSiteSettings: new SiteSetting(),
    siteSpecificSettings: Map<string, SiteSetting>()
}) {}

export class AppSettings extends Record({
    generalSettings: new GeneralSettings(),
    siteSettings: new SiteSettings(),
}) {}
