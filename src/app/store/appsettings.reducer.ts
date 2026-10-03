import { createReducer, on } from "@ngrx/store";
import {
  addHeader,
  addSite,
  HeaderTarget,
  removeHeader,
  removeSite,
  updateAppSettings,
  updateGeneralAppSettings,
  updateHeader,
  updateSiteSettings,
  updateSiteUrl
} from "./appsettings.actions";
import { AppSettings, SiteSetting } from "../settings/app-settings";
import { Map } from 'immutable';

export const initialState: AppSettings = new AppSettings();

export const appSettingsReducer = createReducer(
    initialState,
    on(updateAppSettings, (state, props) => props.newSettings),
    on(updateGeneralAppSettings, (state, props) => state.set("generalSettings", props.newGeneralSettings)),
    on(updateSiteSettings, (state, props) => state.set("siteSettings", props.newSiteSettings)),
    on(updateSiteUrl, (state, props) => {
        const existingSiteSpecificEntry = state.siteSettings.siteSpecificSettings.get(props.previousSiteUrl);
        if (existingSiteSpecificEntry === undefined) {
            throw new Error("entry not found");
        }
        const newMap = state.siteSettings.siteSpecificSettings.remove(props.previousSiteUrl).set(props.newSiteUrl, existingSiteSpecificEntry.set("siteUrl", props.newSiteUrl));
        return setSiteSettings(state, newMap);
    }),
    on(updateHeader, (state, props) => {
        const existingSiteSpecificEntry = getSite(state, props.target);
        if (existingSiteSpecificEntry === undefined) {
            throw new Error("site url not present");
        }
        const existingHeader = existingSiteSpecificEntry.headers.get(props.previousKey);
        if (existingHeader === undefined) {
            throw new Error("header not present");
        }
        const updatedMap = existingSiteSpecificEntry.headers.remove(props.previousKey).set(props.newKey, props.newValue);
        return setHeaders(state, props.target, updatedMap);
    }),
    on(addHeader, (state, props) => {
        const existingSiteSpecificEntry = getSite(state, props.target);
        if (existingSiteSpecificEntry === undefined) {
            throw new Error("site url not present");
        }
        const existingHeader = existingSiteSpecificEntry.headers.get(props.key);
        if (existingHeader !== undefined) {
            throw new Error("header already present");
        }
        const updatedMap = existingSiteSpecificEntry.headers.set(props.key, props.value);
        return setHeaders(state, props.target, updatedMap);
    }),
    on(removeHeader, (state, props) => {
        const existingSiteSpecificEntry = getSite(state, props.target);
        if (existingSiteSpecificEntry === undefined) {
            throw new Error("site url not present");
        }
        const updatedMap = existingSiteSpecificEntry.headers.remove(props.key);
        return setHeaders(state, props.target, updatedMap);
    }),
    on(addSite, (state, props) => {
        const existingSite = state.siteSettings.siteSpecificSettings.get(props.siteUrl);
        if (existingSite !== undefined) {
            throw new Error("site already exists");
        }
        return setSite(state, props.siteUrl, new SiteSetting({ siteUrl: props.siteUrl }));
    }),
    on(removeSite, (state, props) => {
        const existingSite = state.siteSettings.siteSpecificSettings.get(props.siteUrl);
        if (existingSite === undefined) {
            throw new Error("site does not exists");
        }
        return setSiteSettings(state, state.siteSettings.siteSpecificSettings.remove(props.siteUrl));
    })
);

const getSite = (state: AppSettings, target: HeaderTarget): SiteSetting | undefined =>
  target.kind === 'global'
    ? state.siteSettings.globalSiteSettings
    : state.siteSettings.siteSpecificSettings.get(target.siteUrl);

const setHeaders = (state: AppSettings, target: HeaderTarget, headers: Map<string, string>): AppSettings => {
  const updatedEntry = getSite(state, target)!.set("headers", headers);
  if (target.kind === 'global') {
    return state.set("siteSettings", state.siteSettings.set("globalSiteSettings", updatedEntry));
  }
  return setSite(state, target.siteUrl, updatedEntry);
}

const setSite = (state: AppSettings, siteUrl: string, siteSpecificSettings: SiteSetting): AppSettings => {
  const updatedSiteSettings = state.siteSettings.siteSpecificSettings.set(siteUrl, siteSpecificSettings);
  return setSiteSettings(state, updatedSiteSettings);
}

const setSiteSettings = (state: AppSettings, siteSettings: Map<string, SiteSetting>): AppSettings => {
    return state.set("siteSettings", state.siteSettings.set("siteSpecificSettings", siteSettings));
}
