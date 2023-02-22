import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-general-settings-page',
  templateUrl: './general-settings-page.component.html',
  styleUrls: ['./general-settings-page.component.scss']
})
export class GeneralSettingsPageComponent implements OnInit {

  constructor(private settingsService: SettingsService, private snackBar: MatSnackBar) {
   }

  ngOnInit(): void {
  }

  saveSites(): void {
    this.settingsService.SaveCurrentSettings(),
    this.snackBar.open("Settings saved.");
  }

}
