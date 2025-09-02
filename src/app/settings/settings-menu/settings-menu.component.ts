import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { SettingsViewComponent } from '../settings-view/settings-view.component';
import {SiteSettingsPageComponent} from '../site-settings-page/site-settings-page.component';

@Component({
    selector: 'app-settings-menu',
    templateUrl: './settings-menu.component.html',
    styleUrls: ['./settings-menu.component.scss'],
    standalone: false
})
export class SettingsMenuComponent implements OnInit {

  constructor(private dialog: MatDialog) {
    
   }

  ngOnInit(): void {
  }

  openSiteSettings() {
    this.dialog.open(SettingsViewComponent, {
      height: '80%',
      width: '80%',
    });
  }
}
