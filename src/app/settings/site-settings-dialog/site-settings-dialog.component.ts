import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {SettingsService} from '../services/settings.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-site-settings-dialog',
  templateUrl: './site-settings-dialog.component.html',
  styleUrls: ['./site-settings-dialog.component.css']
})
export class SiteSettingsDialogComponent implements OnInit {

  siteFormControls: FormControl[] = [];
  constructor(private settingsService: SettingsService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.initSites();
  }

  initSites(){
    this.siteFormControls = [];
    const sites = this.settingsService.getSites();
    sites.forEach(x => {
      const control = new FormControl(x);
      control.disable();
      this.siteFormControls.push(control);
    });
    if(sites.length == 0){
      this.siteFormControls.push(new FormControl(''));
    }
  }

  saveSites(): void {
    let sites = this.siteFormControls
      .filter(x => x.getRawValue().trim() != '')
      .map(x => x.getRawValue());
    this.settingsService.setSites(sites);
    this.initSites();
    this.snackBar.open("Sites saved.");
  }

  addSite(): void {
    this.siteFormControls.push(new FormControl(''));
  }

  removeSite(index: number): void {
    this.siteFormControls.splice(index, 1);
    if(this.siteFormControls.length == 0) {
      this.addSite();
    }
  }

}
