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

/** In the header actions, siteUrl null addresses the global site settings. */
export const updateHeader = createAction(
    '[AppSettings]->[SiteSettings] UpdateHeader',
    props<{ siteUrl: string | null, previousKey: string, newKey: string, newValue: string}>());

export const addHeader = createAction(
    '[AppSettings]->[SiteSettings] AddHeader',
    props<{ siteUrl: string | null, key: string, value: string }>());

export const removeHeader = createAction(
    '[AppSettings]->[SiteSettings] RemoveHeader',
    props<{ siteUrl: string | null, key: string }>());

export const addSite = createAction(
    '[AppSettings]->[SiteSettings] AddSite',
    props<{ siteUrl: string }>());

export const removeSite = createAction(
    '[AppSettings]->[SiteSettings] RemoveSite',
    props<{ siteUrl: string }>());
