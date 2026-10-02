import { Component, inject, viewChildren } from '@angular/core';
import { SiteSettingsComponent } from '../site-settings/site-settings.component';
import {FormControl} from '@angular/forms';
import { AppSettings, SiteSetting, SiteSettings } from '../app-settings';
import { Store } from '@ngrx/store';
import { addSite, removeSite } from 'src/app/store/appsettings.actions';

@Component({
    selector: 'app-site-settings-page',
    templateUrl: './site-settings-page.component.html',
    styleUrls: ['./site-settings-page.component.scss'],
    standalone: false
})
export class SiteSettingsPageComponent {
  private store = inject<Store<{
    appSettings: AppSettings;
}>>(Store);


  siteFormControls: FormControl[] = [];
  siteSettings: SiteSettings = new SiteSettings();
  /**
   * Every edit replaces the site's immutable record, so the sites are tracked by an id that survives edits.
   * Otherwise each edit recreates the site's panel, which collapses it and drops the focus.
   * Sorting by id keeps a renamed site in place.
   */
  sites: { id: number, setting: SiteSetting }[] = [];
  siteUrls: string[] = [];
  private siteComponents = viewChildren(SiteSettingsComponent);
  private siteIds = new Map<string, number>();
  private nextSiteId = 0;

  constructor() {
    const store = this.store;

    store
      .select(state => state.appSettings.siteSettings)
      .subscribe({
        next: siteSettings => {
          this.siteSettings = siteSettings;
          this.updateSites();
        }
      })
   }

  // sites are keyed by host, so there can be only one new site without a host; it is opened for entering the host
  addSite(): void {
    if (!this.findNewSite()) {
      this.store.dispatch(addSite({ siteUrl: "" }));
    }
    // the panel of a just added site is rendered with the next change detection
    setTimeout(() => this.findNewSite()?.focusHost());
  }

  private findNewSite(): SiteSettingsComponent | undefined {
    return this.siteComponents().find(c => !c.isGlobal && c.siteSetting?.siteUrl === "");
  }

  removeSite(siteUrl: string): void {
    this.store.dispatch(removeSite({ siteUrl }));
  }

  /** Called before the rename is dispatched, so the renamed site keeps its id. */
  renameSiteId(change: { previousSiteUrl: string, newSiteUrl: string }) {
    const id = this.siteIds.get(change.previousSiteUrl);
    if (id === undefined) return;
    this.siteIds.delete(change.previousSiteUrl);
    this.siteIds.set(change.newSiteUrl, id);
  }

  private updateSites() {
    const settings = Array.from(this.siteSettings.siteSpecificSettings.values());
    this.siteUrls = settings.map(s => s.siteUrl);
    const urls = new Set(this.siteUrls);
    for (const url of Array.from(this.siteIds.keys())) {
      if (!urls.has(url)) this.siteIds.delete(url);
    }
    this.sites = settings
      .map(setting => ({ id: this.siteId(setting.siteUrl), setting }))
      .sort((a, b) => a.id - b.id);
  }

  private siteId(siteUrl: string): number {
    let id = this.siteIds.get(siteUrl);
    if (id === undefined) {
      id = this.nextSiteId++;
      this.siteIds.set(siteUrl, id);
    }
    return id;
  }
}
