import { Component, OnInit } from '@angular/core';
import {HeaderSettingsDialogComponent} from '../header-settings-dialog/header-settings-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css']
})
export class SettingsMenuComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openHeaderSettings() {
    this.dialog.open(HeaderSettingsDialogComponent, {
      maxHeight: '100%',
      maxWidth: '100%',
      height: '100%',
      width: '100%'
    });
  }
}
