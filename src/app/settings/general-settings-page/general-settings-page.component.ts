import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeneralSettings } from '../services/AppSettings';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-general-settings-page',
  templateUrl: './general-settings-page.component.html',
  styleUrls: ['./general-settings-page.component.scss']
})
export class GeneralSettingsPageComponent implements OnInit {

  generalSettings: GeneralSettings;
  checked = false;
  showRawTab: FormControl<boolean>= new FormControl();
  showClasses: FormControl<boolean>= new FormControl();
  showEmptyEntities: FormControl<boolean>= new FormControl();
  showEmptyProperties: FormControl<boolean>= new FormControl();
  showNullProperties: FormControl<boolean>= new FormControl();
  showEmptyLinks: FormControl<boolean>= new FormControl();
  showEmptyActions: FormControl<boolean>= new FormControl();
  useEmbeddingPropertyForActionParameters: FormControl<boolean>= new FormControl();
  showHostInformation: FormControl<boolean>= new FormControl();
  actionExecutionTimeoutMs: FormControl<number>= new FormControl();

  constructor(private settingsService: SettingsService, private snackBar: MatSnackBar, private formBuilder: FormBuilder) {
    this.generalSettings = settingsService.CurrentSettings.GeneralSettings;
   }

  ngOnInit(): void {
    this.showRawTab = new FormControl<boolean>(this.generalSettings.showRawTab, { nonNullable: true });
    this.showRawTab.valueChanges.subscribe(v => this.generalSettings.showRawTab = v);

    this.showClasses = new FormControl<boolean>(this.generalSettings.showClasses, { nonNullable: true });
    this.showClasses.valueChanges.subscribe(v => this.generalSettings.showClasses = v);

    this.showEmptyEntities = new FormControl<boolean>(this.generalSettings.showEmptyEntities, { nonNullable: true });
    this.showEmptyEntities.valueChanges.subscribe(v => this.generalSettings.showEmptyEntities = v);

    this.showEmptyProperties = new FormControl<boolean>(this.generalSettings.showEmptyProperties, { nonNullable: true });
    this.showEmptyProperties.valueChanges.subscribe(v => this.generalSettings.showEmptyProperties = v);

    this.showNullProperties = new FormControl<boolean>(this.generalSettings.showNullProperties, { nonNullable: true });
    this.showNullProperties.valueChanges.subscribe(v => this.generalSettings.showNullProperties = v);

    this.showEmptyLinks = new FormControl<boolean>(this.generalSettings.showEmptyLinks, { nonNullable: true });
    this.showEmptyLinks.valueChanges.subscribe(v => this.generalSettings.showEmptyLinks = v);

    this.showEmptyActions = new FormControl<boolean>(this.generalSettings.showEmptyActions, { nonNullable: true });
    this.showEmptyActions.valueChanges.subscribe(v => this.generalSettings.showEmptyActions = v);

    this.useEmbeddingPropertyForActionParameters = new FormControl<boolean>(this.generalSettings.useEmbeddingPropertyForActionParameters, { nonNullable: true });
    this.useEmbeddingPropertyForActionParameters.valueChanges.subscribe(v => this.generalSettings.useEmbeddingPropertyForActionParameters = v);

    this.showHostInformation = new FormControl<boolean>(this.generalSettings.showHostInformation, { nonNullable: true });
    this.showHostInformation.valueChanges.subscribe(v => this.generalSettings.showHostInformation = v);

    this.actionExecutionTimeoutMs = new FormControl<number>(this.generalSettings.actionExecutionTimeoutMs, {validators:Validators.required, nonNullable: true });
    this.actionExecutionTimeoutMs.valueChanges.subscribe(v => {
      if (v == null) {
        this.generalSettings.actionExecutionTimeoutMs = 60000;
      } 
      else 
      {
        this.generalSettings.actionExecutionTimeoutMs = v;
      }
    });
  }

  saveSites(): void {
    this.settingsService.SaveCurrentSettings(),
    this.snackBar.open("Settings saved.");
  }




}
