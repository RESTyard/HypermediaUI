import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderSettingsDialogComponent } from './header-settings-dialog/header-settings-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ReactiveFormsModule} from '@angular/forms';
import {SettingsService} from './services/settings.service';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from '@angular/material/snack-bar';
import { SettingsMenuComponent } from './settings-menu/settings-menu.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {EncryptionService} from './services/encryption.service';

@NgModule({
  declarations: [
    HeaderSettingsDialogComponent,
    SettingsMenuComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDividerModule
  ],
  exports: [
    SettingsMenuComponent
  ],
  providers: [
    EncryptionService,
    SettingsService,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2000}},
  ]
})
export class SettingsModule { }
