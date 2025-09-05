import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSettings, GeneralSettings, Test } from '../app-settings';
import { Store } from '@ngrx/store';
import { updateAppSettings, updateGeneralAppSettings } from 'src/app/store/appsettings.actions';
import { SettingsService } from '../services/settings.service';
import { AppConfig } from 'src/app.config.service';

@Component({
    selector: 'app-general-settings-page',
    templateUrl: './general-settings-page.component.html',
    styleUrls: ['./general-settings-page.component.scss'],
    standalone: false
})
export class GeneralSettingsPageComponent implements OnInit {

  generalSettings: GeneralSettings = new GeneralSettings();
  checked = false;
  showRawTab: FormControl<boolean>= new FormControl();
  disableDeveloperControls: boolean = false;
  showClasses: FormControl<boolean>= new FormControl();
  showEmptyEntities: FormControl<boolean>= new FormControl();
  showEmptyProperties: FormControl<boolean>= new FormControl();
  showNullProperties: FormControl<boolean>= new FormControl();
  showEmptyLinks: FormControl<boolean>= new FormControl();
  showEmptyActions: FormControl<boolean>= new FormControl();
  useEmbeddingPropertyForActionParameters: FormControl<boolean>= new FormControl();
  showHostInformation: FormControl<boolean>= new FormControl();
  actionExecutionTimeoutMs: FormControl<number>= new FormControl();

  constructor(
    private settingsService: SettingsService,
    private store: Store<{ appSettings: AppSettings, appConfig: AppConfig }>,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder) {
      store
        .select(state => state.appSettings.generalSettings)
        .subscribe({
          next: generalSettings => this.generalSettings = generalSettings,
        });
      store
        .select(state => state.appConfig.disableDeveloperControls)
        .subscribe({
          next: d => this.disableDeveloperControls = d,
        });
   }

  ngOnInit(): void {
    this.showRawTab = new FormControl<boolean>(this.generalSettings.showRawTab, { nonNullable: true });
    this.showRawTab.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showRawTab", v)})));

    this.showClasses = new FormControl<boolean>(this.generalSettings.showClasses, { nonNullable: true });
    this.showClasses.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showClasses", v)})));

    this.showEmptyEntities = new FormControl<boolean>(this.generalSettings.showEmptyEntities, { nonNullable: true });
    this.showEmptyEntities.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showEmptyEntities", v)})));

    this.showEmptyProperties = new FormControl<boolean>(this.generalSettings.showEmptyProperties, { nonNullable: true });
    this.showEmptyProperties.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showEmptyProperties", v)})));

    this.showNullProperties = new FormControl<boolean>(this.generalSettings.showNullProperties, { nonNullable: true });
    this.showNullProperties.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showNullProperties", v)})));

    this.showEmptyLinks = new FormControl<boolean>(this.generalSettings.showEmptyLinks, { nonNullable: true });
    this.showEmptyLinks.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showEmptyLinks", v)})));

    this.showEmptyActions = new FormControl<boolean>(this.generalSettings.showEmptyActions, { nonNullable: true });
    this.showEmptyActions.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showEmptyActions", v)})));

    this.useEmbeddingPropertyForActionParameters = new FormControl<boolean>(this.generalSettings.useEmbeddingPropertyForActionParameters, { nonNullable: true });
    this.useEmbeddingPropertyForActionParameters.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("useEmbeddingPropertyForActionParameters", v)})));

    this.showHostInformation = new FormControl<boolean>(this.generalSettings.showHostInformation, { nonNullable: true });
    this.showHostInformation.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showHostInformation", v)})));

    this.actionExecutionTimeoutMs = new FormControl<number>(this.generalSettings.actionExecutionTimeoutMs, {validators:Validators.required, nonNullable: true });
    this.actionExecutionTimeoutMs.valueChanges.subscribe(v => {
      const value = v == null ? 60000 : v;
      this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("actionExecutionTimeoutMs", value)}));
    });
  }

  saveSites(): void {
    this.settingsService.SaveCurrentSettings(),
    this.snackBar.open("Settings saved.");
  }




}
