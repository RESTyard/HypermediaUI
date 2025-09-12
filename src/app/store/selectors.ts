import { createSelector } from "@ngrx/store";
import { AppSettings, GeneralSettings } from "../settings/app-settings";
import { AppConfig } from "src/app.config.service";
import {CurrentEntryPoint} from "./entrypoint.reducer";
import {jwtDecode, JwtPayload} from "jwt-decode";

export const selectEffectiveGeneralSettings = createSelector(
    (state: { appSettings: AppSettings, appConfig: AppConfig }) => state.appSettings.generalSettings,
    (state) => state.appConfig,
    (generalSettings, appConfig) => {
        return new GeneralSettings({
            showRawTab: generalSettings.showRawTab && !appConfig.disableDeveloperControls,
            showClasses: generalSettings.showClasses && !appConfig.disableDeveloperControls,
            showEmptyEntities: generalSettings.showEmptyEntities && !appConfig.disableDeveloperControls,
            showEmptyProperties: generalSettings.showEmptyProperties && !appConfig.disableDeveloperControls,
            showNullProperties: generalSettings.showNullProperties && !appConfig.disableDeveloperControls,
            showEmptyLinks: generalSettings.showEmptyLinks && !appConfig.disableDeveloperControls,
            showEmptyActions: generalSettings.showEmptyActions && !appConfig.disableDeveloperControls,
            useEmbeddingPropertyForActionParameters: generalSettings.useEmbeddingPropertyForActionParameters && !appConfig.disableDeveloperControls,
            showHostInformation: generalSettings.showHostInformation && !appConfig.disableDeveloperControls,
            actionExecutionTimeoutMs: generalSettings.actionExecutionTimeoutMs
        });
    }
);

export const selectUserNameForCurrentSite = createSelector(
  (state: { currentEntryPoint: CurrentEntryPoint, appSettings: AppSettings }) => state.currentEntryPoint,
  (state) => state.appSettings.siteSettings.siteSpecificSettings,
  (currentEntryPoint, siteMap) => {
    if(!currentEntryPoint.entryPoint) {
      return undefined;
    }
    const authHeader = siteMap.get(new URL(currentEntryPoint.entryPoint).host)?.headers.get('Authorization');
    if(!authHeader) {
      return undefined;
    }
    try {
      const decoded = jwtDecode<JwtPayloadWithName>(authHeader.slice('Bearer '.length))
      return decoded.name;
    } catch {
      return undefined;
    }
  }
)

interface JwtPayloadWithName extends JwtPayload {
  name?: string;
}
