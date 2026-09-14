import { Component, OnInit, inject } from '@angular/core';
import {FormControl} from '@angular/forms';
import { AppSettings, SiteSettings } from '../app-settings';
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
  constructor() {
    const store = this.store;

    store
      .select(state => state.appSettings.siteSettings)
      .subscribe({
        next: siteSettings => {
          this.siteSettings = siteSettings;
        }
      })
   }

  addSite(): void {
    this.store.dispatch(addSite({ siteUrl: "" }));
  }

  removeSite(index: number): void {
    const site = Array.from(this.siteSettings.siteSpecificSettings.entries())[index];
    this.store.dispatch(removeSite({ siteUrl: site[0] }));
  }
}
