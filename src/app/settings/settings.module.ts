import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { SiteSettingsDialogComponent } from './site-settings-dialog/site-settings-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SiteSettingsComponent } from './site-settings/site-settings.component';

@NgModule({
  declarations: [
    SiteSettingsComponent,
    SettingsMenuComponent,
    SiteSettingsDialogComponent
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
    MatDividerModule,
    MatExpansionModule,
    MatIconModule

  ],
  exports: [
    SettingsMenuComponent
  ],
  providers: [
    SettingsService,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2000}},
  ]
})
export class SettingsModule { }
