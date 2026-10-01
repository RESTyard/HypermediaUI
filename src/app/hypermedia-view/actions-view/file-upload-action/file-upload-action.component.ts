import { Component, Input, OnInit, inject } from '@angular/core';
import {HypermediaAction} from '../../siren-parser/hypermedia-action';
import {NgxDropzoneChangeEvent} from 'ngx-dropzone';
import {ActionResults, HypermediaClientService} from '../../hypermedia-client.service';
import {ProblemDetailsError} from '../../../error-dialog/problem-details-error';
import {MatSnackBar} from '@angular/material/snack-bar';
import { getIconForHttpMethod } from '../../icon-mapping';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../common/confirmation-dialog/confirmation-dialog.component';
import {AppConfig} from 'src/app.config.service';
import { FileSizePipe } from 'src/app/common/pipes/file-size.pipe';
import {Store} from "@ngrx/store";
import {AppSettings, GeneralSettings} from "../../../settings/app-settings";
import {selectEffectiveGeneralSettings} from "../../../store/selectors";
import { AbstractControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';

@Component({
    selector: 'app-file-upload-action',
    templateUrl: './file-upload-action.component.html',
    styleUrls: ['./file-upload-action.component.scss'],
    standalone: false
})
export class FileUploadActionComponent implements OnInit {
  private hypermediaClientService = inject(HypermediaClientService);
  private formlyJsonschema = inject(FormlyJsonschema);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private store = inject<Store<{
    appSettings: AppSettings;
    appConfig: AppConfig;
  }>>(Store);


  @Input()
  action!: HypermediaAction;
  files: File[] = [];
  formlyFields: FormlyFieldConfig[] = [];
  form = new FormGroup({});
  model: object | undefined;

  ActionResultsEnum = ActionResults;
  actionResult: ActionResults = ActionResults.undefined;
  actionResultLocation: string | null = null;
  actionMessage: string = "";
  executed: boolean = false; // TODO show multiple executions as list
  problemDetailsError: ProblemDetailsError| null = null

  private fileSizePipe = new FileSizePipe();
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
        }
      });
  }

  ngOnInit() {
    this.action.waheActionParameterJsonSchema?.subscribe((jsonSchema) => {
      this.formlyFields = [
        this.formlyJsonschema.toFieldConfig(jsonSchema, {
          map: (mappedField, mapSource) => {
            if (mappedField.key && mappedField.props) {
              mappedField.props.label = mappedField.key + '';
            }
            const types = mapSource.type === undefined ? [] : mapSource.type instanceof Array ? mapSource.type : [mapSource.type];
            if (types.includes('string') && mapSource.format === 'date') {
              mappedField.type = 'date';
              mappedField.parsers = [
                value => (value instanceof Date ? this.formatDate(value) : value),
              ];
              mappedField.validators = {
                required: (control: AbstractControl) => (types.includes('null') || (control.value !== null && control.value !== undefined)),
              };
            }
            return mappedField;
          },
        }),
      ];
      this.model = this.action.defaultValues;
    });
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const padLeft = (num: number) => `${num < 10 ? '0' + num : num}`;
    return `${year}-${padLeft(month)}-${padLeft(day)}`;
  }

  onSelect($event: NgxDropzoneChangeEvent) {
    this.files.push(...$event.addedFiles);

    // show toast message with size violations
    if($event.rejectedFiles.length > 0){
      let rejectedFilesMessage = "";

      $event.rejectedFiles.forEach((rejectedFile) => {
        if(rejectedFile.reason == 'size') {
          rejectedFilesMessage += `${rejectedFile.name} too big (${this.fileSizePipe.transform(rejectedFile.size)} > ${this.fileSizePipe.transform(this.action.FileUploadConfiguration.MaxFileSizeBytes)})\n`;
        } else if (rejectedFile.reason == 'type'){
          rejectedFilesMessage += `${rejectedFile.name} has wrong type. Acceptable: ${this.action.FileUploadConfiguration.getAcceptString()}\n`
        } else if (rejectedFile.reason == 'no_multiple') {
          rejectedFilesMessage += "Only one file is allowed\n"
        } else {
          rejectedFilesMessage += `${rejectedFile.name} rejected for unknown reason\n`
        }
      });

      this.snackBar.open(rejectedFilesMessage, undefined, {
        panelClass: ['error-snackbar']
      });
    }
  }

  hasFiles():boolean {
    return this.files.length >0
  }

  onRemove($event:File) {
    this.files.splice(this.files.indexOf($event), 1);
  }

  onSubmit() {
    if (this.files.length < 1 || !this.form.valid) {
      return;
    }

    const configs = this.action.getConfigurations(this.appConfig.actionPopupWarningConfigurations);
    this.submitWithConfirmation(configs);
  }

  private submitWithConfirmation(configs: HypermediaUI.IActionClassConfiguration[]) {
    if (configs.length > 0) {
      const config = configs[0];
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: config.title,
          message: config.message
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.submitWithConfirmation(configs.slice(1));
        }
      });
    } else {
      this.doSubmit();
    }
  }

  public getActionConfigs(): HypermediaUI.IActionClassConfiguration[] {
    return this.action.getConfigurations(this.appConfig.actionPopupWarningConfigurations);
  }

  private doSubmit() {
    this.action.files = this.files;
    if (this.action.waheActionParameterName) {
      this.action.parameters = this.form.value;
    }
    this.actionResult= ActionResults.pending;
    this.executed = true;

    this.hypermediaClientService.executeAction(
      this.action,
      (result: ActionResults,
        resultLocation: string | null,
        content: string,
        problemDetailsError: ProblemDetailsError | null) => {

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
      });
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
