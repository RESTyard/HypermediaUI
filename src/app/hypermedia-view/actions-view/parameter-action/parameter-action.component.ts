import { Component, OnInit, Input, inject } from '@angular/core';
import { ProblemDetailsError } from 'src/app/error-dialog/problem-details-error';
import {
  ActionResults,
  HypermediaClientService,
} from '../../hypermedia-client.service';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { getIconForHttpMethod } from '../../icon-mapping';
import { MatDialog } from '@angular/material/dialog';
import {doWithConfirmation} from "../../../common/confirmation-dialog/confirmation-dialog.component";
import {AppConfig} from 'src/app.config.service';
import {Store} from "@ngrx/store";
import {AppSettings, GeneralSettings} from "../../../settings/app-settings";
import {selectEffectiveGeneralSettings} from "../../../store/selectors";
import {actionParameterValue, createActionFormlyFields, describeInvalidControls} from '../../formly-extensions';

@Component({
    selector: 'app-parameter-action',
    templateUrl: './parameter-action.component.html',
    styleUrls: ['./parameter-action.component.scss'],
    standalone: false
})
export class ParameterActionComponent implements OnInit {
  private hypermediaClientService = inject(HypermediaClientService);
  private formlyJsonschema = inject(FormlyJsonschema);
  private dialog = inject(MatDialog);
  private store = inject<Store<{
    appSettings: AppSettings;
    appConfig: AppConfig;
  }>>(Store);

  @Input()
  action!: HypermediaAction;

  ActionResultsEnum = ActionResults;

  actionResult: ActionResults = ActionResults.undefined;
  actionResultLocation: string | null = null;
  actionMessage: string = '';
  executed: boolean = false; // TODO show multiple executions as list
  problemDetailsError: ProblemDetailsError | null = null;

  formlyFields: FormlyFieldConfig[] = [];
  form: FormGroup = new FormGroup({});
  model: object | undefined;
  generalSettings: GeneralSettings = new GeneralSettings();
  appConfig: AppConfig = new AppConfig();

  constructor() {
    this.store
      .select(selectEffectiveGeneralSettings)
      .subscribe({
        next: generalSettings => {
          this.generalSettings = generalSettings;
        },
      });
    this.store
      .select(x => x.appConfig)
      .subscribe({
        next: appConfig => {
          this.appConfig = appConfig;
        },
      });
  }

  ngOnInit() {
    this.action.waheActionParameterJsonSchema?.subscribe((jsonSchema) => {
      this.formlyFields = createActionFormlyFields(this.formlyJsonschema, jsonSchema);
      this.model = this.action.defaultValues;
    });
  }

  canSubmit = () => this.form.valid;

  submitBlockedReason = () => `Please fix: ${describeInvalidControls(this.form).join(', ')}`;

  public onActionSubmitted() {
    if (!this.canSubmit()) {
      console.log('not valid');
      return;
    }

    doWithConfirmation(this.getActionConfigs(), this.dialog, this.doActionSubmitted);
  }

  public getActionConfigs(): HypermediaUI.IActionClassConfiguration[] {
    return this.action.getConfigurations(this.appConfig.actionPopupWarningConfigurations);
  }

  private doActionSubmitted = () => {
    this.action.parameters = actionParameterValue(this.form, this.formlyFields);
    this.actionResult = ActionResults.pending;
    this.executed = true;

    this.hypermediaClientService.executeAction(
      this.action,
      (
        result: ActionResults,
        resultLocation: string | null,
        content: string,
        problemDetailsError: ProblemDetailsError | null,
      ) => {
        this.problemDetailsError = problemDetailsError;
        this.actionResult = result;

        if (problemDetailsError) {
          this.actionMessage = problemDetailsError.title;
        } else {
          this.actionMessage = '';
        }

        // todo handle if it has content AND location
        this.actionResultLocation = resultLocation;
        if (resultLocation && this.generalSettings.autoFollowActionLocationOnSuccess) {
          setTimeout(() => this.navigateLocation(resultLocation), 1000);
        }
      },
    );
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }

  getBrowserUrl(url: string) {
    return this.hypermediaClientService.getBrowserUrl(url);
  }

  getIconForMethod(method: string): string | undefined {
    return getIconForHttpMethod(method);
  }
}
