import { Component, OnInit } from '@angular/core';
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
export class SiteSettingsPageComponent implements OnInit {

  siteFormControls: FormControl[] = [];
  siteSettings: SiteSettings = new SiteSettings();
  constructor(private store: Store<{ appSettings: AppSettings }>) {
    store
      .select(state => state.appSettings.siteSettings)
      .subscribe({
        next: siteSettings => {
          this.siteSettings = siteSettings;
        }
      })
   }

  ngOnInit(): void {
  }

  addSite(): void {
    this.store.dispatch(addSite({ siteUrl: "" }));
  }

  removeSite(index: number): void {
    var site = Array.from(this.siteSettings.siteSpecificSettings.entries())[index];
    this.store.dispatch(removeSite({ siteUrl: site[0] }));
  }
}
