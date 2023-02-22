import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.scss']
})
export class SettingsViewComponent implements OnInit {

  constructor(private settingsService: SettingsService, private snackBar: MatSnackBar) {
   }

  ngOnInit(): void {
  }

  saveSites(): void {
    this.settingsService.SaveCurrentSettings(),
    this.snackBar.open("Settings saved.");
  }

}
