import { Injectable } from '@angular/core';
import { AppSettings, HeaderSetting, SiteSetting, SiteSettings } from './AppSettings';
import { ProblemDetailsError } from 'src/app/error-dialog/problem-details-error';

@Injectable()
export class SettingsService {

  static readonly AppSettingsKey = "appSettings";

  public CurrentSettings: AppSettings = new AppSettings();

  constructor() {
    this.LoadCurrentSettings();
  }

  public LoadCurrentSettings() {

    const settingsRaw = localStorage.getItem(SettingsService.AppSettingsKey);
    if (settingsRaw) {
      this.CurrentSettings = new AppSettings(JSON.parse(settingsRaw));
      return;
    }

    this.CurrentSettings = new AppSettings();
  }

  public SaveCurrentSettings() {
    localStorage.setItem(SettingsService.AppSettingsKey, JSON.stringify(this.CurrentSettings));
  }

  getGlobalHeaders(): HeaderSetting[] {
    return this.CurrentSettings.SiteSettings.GlobalSiteSettings.Headers;
  }

  getHeadersForSite(requestSiteHost: string): HeaderSetting[] {
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

  getSettingsForSite(site: string): SiteSetting {
    this.LoadCurrentSettings();
    let settingsForSite = this.CurrentSettings.SiteSettings.SiteSpecificSettings
        .find(s => s.SiteUrl === site);

    if(!settingsForSite) {
      settingsForSite = new SiteSetting(site);
    }

    return settingsForSite;
  }

  saveSettingsForSite(settings : SiteSetting) {
    let indexOfSettings = this.CurrentSettings.SiteSettings.SiteSpecificSettings
        .findIndex(s => s.SiteUrl === settings.SiteUrl);
    if(indexOfSettings !== -1) {
      this.CurrentSettings.SiteSettings.SiteSpecificSettings.splice(indexOfSettings, 1, settings);
    } else {
      this.CurrentSettings.SiteSettings.SiteSpecificSettings.push(settings);
    }

    this.SaveCurrentSettings();
  }

}
