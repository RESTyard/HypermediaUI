import { Injectable } from '@angular/core';
import { AppSettingsStorageModel, GeneralSettingsStorageModel, HeaderSettingStorageModel, SiteSettingsStorageModel, SiteSettingStorageModel } from './AppSettings';
import { ProblemDetailsError } from 'src/app/error-dialog/problem-details-error';
import { Store } from '@ngrx/store';
import { Map } from 'immutable';
import { updateAppSettings } from 'src/app/store/appsettings.actions';
import { AppSettings, GeneralSettings, SiteSetting, SiteSettings } from '../app-settings';

@Injectable()
export class SettingsService {

  static readonly AppSettingsKey = "appSettings";

  private CurrentSettings: AppSettingsStorageModel = new AppSettingsStorageModel();

  constructor(private store: Store<{ appSettings: AppSettings }>) {
    store
      .select(state => state.appSettings)
      .subscribe({
        next: (appSettings) => {
          this.CurrentSettings = this.mapToStorageModel(appSettings);
        }
      });
    this.LoadCurrentSettings();
  }

  public LoadCurrentSettings() {
    const settingsRaw = localStorage.getItem(SettingsService.AppSettingsKey);
    let newSettings: AppSettingsStorageModel;
    if (settingsRaw) {
      newSettings = new AppSettingsStorageModel(JSON.parse(settingsRaw));
    } else {
      newSettings = new AppSettingsStorageModel();
    }
    this.store.dispatch(updateAppSettings({ newSettings: this.mapFromStorageModel(newSettings) }));
  }

  private mapFromStorageModel(storageModel: AppSettingsStorageModel): AppSettings {
    return new AppSettings({
      generalSettings: this.mapGeneralSettingsFromStorageModel(storageModel.GeneralSettings),
      siteSettings: this.mapSiteSettingsFromStorageModel(storageModel.SiteSettings),
    });
  }

  private mapGeneralSettingsFromStorageModel(storageModel: GeneralSettingsStorageModel) : GeneralSettings {
    return new GeneralSettings({
      showRawTab: storageModel.showRawTab,
      showClasses: storageModel.showClasses,
      showEmptyEntities: storageModel.showEmptyEntities,
      showEmptyProperties: storageModel.showEmptyProperties,
      showNullProperties: storageModel.showNullProperties,
      showEmptyLinks: storageModel.showEmptyLinks,
      showEmptyActions: storageModel.showEmptyActions,
      useEmbeddingPropertyForActionParameters: storageModel.useEmbeddingPropertyForActionParameters,
      showHostInformation: storageModel.showHostInformation,
      actionExecutionTimeoutMs: storageModel.actionExecutionTimeoutMs,
    });
  }

  private mapSiteSettingsFromStorageModel(storageModel: SiteSettingsStorageModel) : SiteSettings {
    return new SiteSettings({
      globalSiteSettings: this.mapSiteSettingFromStorageModel(storageModel.GlobalSiteSettings),
      siteSpecificSettings: Map(storageModel.SiteSpecificSettings.map(setting => [setting.SiteUrl, this.mapSiteSettingFromStorageModel(setting)] as const)),
    });
  }

  private mapSiteSettingFromStorageModel(storageModel: SiteSettingStorageModel) : SiteSetting {
    return new SiteSetting({
      siteUrl: storageModel.SiteUrl,
      headers: Map(storageModel.Headers.map(h => [h.Key, h.Value] as const)),
    });
  }

  private mapToStorageModel(appModel: AppSettings) : AppSettingsStorageModel {
    return new AppSettingsStorageModel({
      GeneralSettings: this.mapGeneralSettingsToStorageModel(appModel.generalSettings),
      SiteSettings: this.mapSiteSettingsToStorageModel(appModel.siteSettings),
    });
  }

  private mapGeneralSettingsToStorageModel(appModel: GeneralSettings) : GeneralSettingsStorageModel {
    return {
      showRawTab: appModel.showRawTab,
      showClasses: appModel.showClasses,
      showEmptyEntities: appModel.showEmptyEntities,
      showEmptyProperties: appModel.showEmptyProperties,
      showNullProperties: appModel.showNullProperties,
      showEmptyLinks: appModel.showEmptyLinks,
      showEmptyActions: appModel.showEmptyActions,
      useEmbeddingPropertyForActionParameters: appModel.useEmbeddingPropertyForActionParameters,
      showHostInformation: appModel.showHostInformation,
      actionExecutionTimeoutMs: appModel.actionExecutionTimeoutMs,
    };
  }

  private mapSiteSettingsToStorageModel(appModel: SiteSettings) : SiteSettingsStorageModel {
    return {
      GlobalSiteSettings: this.mapSiteSettingToStorageModel(appModel.globalSiteSettings),
      SiteSpecificSettings: Array.from(appModel.siteSpecificSettings.values()).map(setting => this.mapSiteSettingToStorageModel(setting)),
    }
  }

  private mapSiteSettingToStorageModel(appModel: SiteSetting) : SiteSettingStorageModel {
    return new SiteSettingStorageModel(
      appModel.siteUrl,
      Array.from(appModel.headers.entries()).map(e => new HeaderSettingStorageModel(e[0], e[1]))
    );
  }

  public SaveCurrentSettings() {
    localStorage.setItem(SettingsService.AppSettingsKey, JSON.stringify(this.CurrentSettings));
  }

  getGlobalHeaders(): HeaderSettingStorageModel[] {
    return this.CurrentSettings.SiteSettings.GlobalSiteSettings.Headers;
  }

  getHeadersForSite(requestSiteHost: string): HeaderSettingStorageModel[] {
    let specificSettings = this.CurrentSettings.SiteSettings.SiteSpecificSettings.filter(site => site.SiteUrl.trim() != '' && site.SiteUrl === requestSiteHost);
    // we should only find one site
    if (specificSettings.length > 1) {
      throw new ProblemDetailsError({
        title: "Too many matches for given host",
        detail: `${requestSiteHost} was found ${specificSettings.length} times in settings. Make sure each entry only exists once.`,
        status: 0
      })
    }
    if (specificSettings.length == 0) {
      return [];
    }

    return specificSettings[0].Headers;
  }

}
