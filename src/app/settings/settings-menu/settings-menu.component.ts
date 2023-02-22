import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SiteSettingsDialogComponent} from '../site-settings-dialog/site-settings-dialog.component';

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.scss']
})
export class SettingsMenuComponent implements OnInit {

  constructor(private dialog: MatDialog) {
    this.openSiteSettings();
   }

  ngOnInit(): void {
  }

  openSiteSettings() {
    this.dialog.open(SiteSettingsDialogComponent, {
      height: '80%',
      width: '80%',
    });
  }
}
