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
import { SiteSettingsPageComponent } from './site-settings-page/site-settings-page.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SiteSettingsComponent } from './site-settings/site-settings.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatTabsModule } from '@angular/material/tabs';
import { SettingsViewComponent } from './settings-view/settings-view.component';
import { GeneralSettingsPageComponent } from './general-settings-page/general-settings-page.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatListModule} from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    SiteSettingsComponent,
    SettingsMenuComponent,
    SiteSettingsPageComponent,
    SettingsViewComponent,
    GeneralSettingsPageComponent
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
    MatIconModule,
    FlexLayoutModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatListModule,
    MatTooltipModule

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
