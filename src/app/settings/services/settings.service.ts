import { Injectable } from '@angular/core';
import { AppSettings, HeaderSetting, SiteSettings } from './AppSettings';
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
      this.CurrentSettings = Object.assign(this.CurrentSettings, JSON.parse(settingsRaw));
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

}
