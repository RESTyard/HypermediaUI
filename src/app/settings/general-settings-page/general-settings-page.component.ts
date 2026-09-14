import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSettings, GeneralSettings } from '../app-settings';
import { Store } from '@ngrx/store';
import { updateGeneralAppSettings } from 'src/app/store/appsettings.actions';
import { SettingsService } from '../services/settings.service';
import { AppConfig } from 'src/app.config.service';

@Component({
    selector: 'app-general-settings-page',
    templateUrl: './general-settings-page.component.html',
    styleUrls: ['./general-settings-page.component.scss'],
    standalone: false
})
export class GeneralSettingsPageComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private store = inject<Store<{
    appSettings: AppSettings;
    appConfig: AppConfig;
}>>(Store);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);


  generalSettings: GeneralSettings = new GeneralSettings();
  checked = false;
  showRawTab: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  disableDeveloperControls: boolean = false;
  showClasses: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  showEmptyEntities: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  showEmptyProperties: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  showNullProperties: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  showEmptyLinks: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  showEmptyActions: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  useEmbeddingPropertyForActionParameters: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  showHostInformation: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  showPropertyTreeControls: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });
  actionExecutionTimeoutMs: FormControl<number> = new FormControl<number>(0, { validators: Validators.required, nonNullable: true });

  constructor() {
      const store = this.store;

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
    this.showRawTab.setValue(this.generalSettings.showRawTab);
    this.showRawTab.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showRawTab", v)})));

    this.showClasses.setValue(this.generalSettings.showClasses);
    this.showClasses.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showClasses", v)})));

    this.showEmptyEntities.setValue(this.generalSettings.showEmptyEntities);
    this.showEmptyEntities.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showEmptyEntities", v)})));

    this.showEmptyProperties.setValue(this.generalSettings.showEmptyProperties);
    this.showEmptyProperties.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showEmptyProperties", v)})));

    this.showNullProperties.setValue(this.generalSettings.showNullProperties);
    this.showNullProperties.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showNullProperties", v)})));

    this.showEmptyLinks.setValue(this.generalSettings.showEmptyLinks);
    this.showEmptyLinks.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showEmptyLinks", v)})));

    this.showEmptyActions.setValue(this.generalSettings.showEmptyActions);
    this.showEmptyActions.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showEmptyActions", v)})));

    this.useEmbeddingPropertyForActionParameters.setValue(this.generalSettings.useEmbeddingPropertyForActionParameters);
    this.useEmbeddingPropertyForActionParameters.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("useEmbeddingPropertyForActionParameters", v)})));

    this.showHostInformation.setValue(this.generalSettings.showHostInformation);
    this.showHostInformation.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showHostInformation", v)})));

    this.showPropertyTreeControls.setValue(this.generalSettings.showPropertyTreeControls);
    this.showPropertyTreeControls.valueChanges.subscribe(v => this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("showPropertyTreeControls", v)})));

    this.actionExecutionTimeoutMs.setValue(this.generalSettings.actionExecutionTimeoutMs);
    this.actionExecutionTimeoutMs.valueChanges.subscribe(v => {
      const value = v == null ? 60000 : v;
      this.store.dispatch(updateGeneralAppSettings({ newGeneralSettings: this.generalSettings.set("actionExecutionTimeoutMs", value)}));
    });
  }

  saveSites(): void {
    this.settingsService.SaveCurrentSettings();
    this.snackBar.open("Settings saved.");
  }




}
