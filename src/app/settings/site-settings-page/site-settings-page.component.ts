import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {SettingsService} from '../services/settings.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { SiteSetting, SiteSettings } from '../services/AppSettings';

@Component({
  selector: 'app-site-settings-page',
  templateUrl: './site-settings-page.component.html',
  styleUrls: ['./site-settings-page.component.scss']
})
export class SiteSettingsPageComponent implements OnInit {

  siteFormControls: FormControl[] = [];
  siteSettings: SiteSettings;
  constructor(private settingsService: SettingsService) {
    settingsService.LoadCurrentSettings();
    this.siteSettings = settingsService.CurrentSettings.SiteSettings;
   }

  ngOnInit(): void {
  }

  addSite(): void {
    this.siteSettings.SiteSpecificSettings.push(new SiteSetting());
  }

  removeSite(index: number): void {
    this.siteSettings.SiteSpecificSettings.splice(index, 1);
  }
}
