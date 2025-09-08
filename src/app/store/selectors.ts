import { createSelector } from "@ngrx/store";
import { AppSettings, GeneralSettings } from "../settings/app-settings";
import { AppConfig } from "src/app.config.service";

export const selectEffectiveGeneralSettings = createSelector(
    (state: { appSettings: AppSettings, appConfig: AppConfig }) => state.appSettings.generalSettings,
    (state: { appSettings: AppSettings, appConfig: AppConfig }) => state.appConfig,
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
)