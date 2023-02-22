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
  siteSettings: SiteSettings| null = null;
  constructor(private settingsService: SettingsService, private snackBar: MatSnackBar) {
    settingsService.LoadCurrentSettings();
    this.siteSettings = settingsService.CurrentSettings.SiteSettings;
   }

  ngOnInit(): void {
  }

  saveSites(): void {
    this.settingsService.SaveCurrentSettings(),
    this.snackBar.open("Settings saved.");
  }

  addSite(): void {
    this.settingsService.CurrentSettings.SiteSettings.SiteSpecificSettings.push(new SiteSetting());
  }

  removeSite(index: number): void {
    this.settingsService.CurrentSettings.SiteSettings.SiteSpecificSettings.splice(index-1, 1);
  }
}
