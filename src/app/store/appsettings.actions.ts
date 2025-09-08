import { createAction, props } from "@ngrx/store";
import {AppSettings, AuthenticationConfiguration, GeneralSettings, SiteSettings} from "../settings/app-settings";

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

export const updateHeader = createAction(
    '[AppSettings]->[SiteSettings] UpdateHeader',
    props<{ siteUrl: string, previousKey: string, newKey: string, newValue: string}>());

export const addHeader = createAction(
    '[AppSettings]->[SiteSettings] AddHeader',
    props<{ siteUrl: string, key: string, value: string }>());

export const removeHeader = createAction(
    '[AppSettings]->[SiteSettings] RemoveHeader',
    props<{ siteUrl: string, key: string }>());

export const addSite = createAction(
    '[AppSettings]->[SiteSettings] AddSite',
    props<{ siteUrl: string }>());

export const removeSite = createAction(
    '[AppSettings]->[SiteSettings] RemoveSite',
    props<{ siteUrl: string }>());

export const setAuthConfig = createAction(
  '[AppSettings]->[SiteSettings] SetAuthConfig',
  props<{ siteUrl: string, authConfig: AuthenticationConfiguration | undefined}>()
)
