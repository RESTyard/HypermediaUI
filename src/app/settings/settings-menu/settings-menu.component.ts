import { Component, inject } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { SettingsViewComponent } from '../settings-view/settings-view.component';

@Component({
    selector: 'app-settings-menu',
    templateUrl: './settings-menu.component.html',
    styleUrls: ['./settings-menu.component.scss'],
    standalone: false
})
export class SettingsMenuComponent {
  private dialog = inject(MatDialog);


  openSiteSettings() {
    this.dialog.open(SettingsViewComponent, {
      height: '80%',
      width: '80%',
    });
  }
}
