import { createAction, props } from "@ngrx/store";
import {AppSettings, GeneralSettings, SiteSettings} from "../settings/app-settings";

export const updateAppSettings = createAction(
    '[AppSettings] Update',
    props<{ newSettings: AppSettings }>());

export const updateGeneralAppSettings = createAction(
    '[AppSettings->GeneralSettings] Update',
    props<{ newGeneralSettings: GeneralSettings }>());

export const updateSiteSettings = createAction(
    '[AppSettings->SiteSettings] Update',
    props<{ newSiteSettings: SiteSettings }>());

export const updateSiteUrl = createAction(
    '[AppSettings]->[SiteSettings] UpdateSiteUrl',
    props<{ previousSiteUrl: string, newSiteUrl: string }>());

/**
 * Which settings a header action changes. Global headers go to every outgoing request,
 * so they must be addressed explicitly rather than by a missing site url.
 */
export type HeaderTarget = { kind: 'global' } | { kind: 'site', siteUrl: string };

export const globalHeaderTarget: HeaderTarget = { kind: 'global' };

export const siteHeaderTarget = (siteUrl: string): HeaderTarget => ({ kind: 'site', siteUrl });

export const updateHeader = createAction(
    '[AppSettings]->[SiteSettings] UpdateHeader',
    props<{ target: HeaderTarget, previousKey: string, newKey: string, newValue: string}>());

export const addHeader = createAction(
    '[AppSettings]->[SiteSettings] AddHeader',
    props<{ target: HeaderTarget, key: string, value: string }>());

export const removeHeader = createAction(
    '[AppSettings]->[SiteSettings] RemoveHeader',
    props<{ target: HeaderTarget, key: string }>());

export const addSite = createAction(
    '[AppSettings]->[SiteSettings] AddSite',
    props<{ siteUrl: string }>());

export const removeSite = createAction(
    '[AppSettings]->[SiteSettings] RemoveSite',
    props<{ siteUrl: string }>());
