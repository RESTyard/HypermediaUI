import { Component, Input, OnInit, inject } from '@angular/core';
import {HypermediaAction} from '../../siren-parser/hypermedia-action';
import {FileInputValue} from '@ngx-dropzone/cdk';
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
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import {createActionFormlyFields} from '../../formly-extensions';
import { getIconForMimeType } from '../../mime-type-icon-mapping';

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
      this.formlyFields = createActionFormlyFields(this.formlyJsonschema, jsonSchema);
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

  onSelect(value: FileInputValue) {
    const selectedFiles = value === null ? [] : Array.isArray(value) ? value : [value];
    const acceptedFiles: File[] = [];
    const rejectedFilesMessage: string[] = [];

    selectedFiles.forEach((file) => {
      if (!this.acceptsFile(file)) {
        rejectedFilesMessage.push(`${file.name} has wrong type. Acceptable: ${this.action.FileUploadConfiguration.getAcceptString()}`);
      } else if (this.action.FileUploadConfiguration.MaxFileSizeBytes > -1 && file.size > this.action.FileUploadConfiguration.MaxFileSizeBytes) {
        rejectedFilesMessage.push(`${file.name} too big (${this.fileSizePipe.transform(file.size)} > ${this.fileSizePipe.transform(this.action.FileUploadConfiguration.MaxFileSizeBytes)})`);
      } else if (!this.action.FileUploadConfiguration.AllowMultiple && (this.files.length > 0 || acceptedFiles.length > 0)) {
        rejectedFilesMessage.push('Only one file is allowed');
      } else {
        acceptedFiles.push(file);
      }
    });

    this.files.push(...acceptedFiles);
    if (rejectedFilesMessage.length > 0) {
      this.snackBar.open(rejectedFilesMessage.join('\n'), undefined, {
        panelClass: ['error-snackbar']
      });
    }
  }

  private acceptsFile(file: File): boolean {
    const accept = this.action.FileUploadConfiguration.Accept;
    if (accept.length === 0 || accept.includes('*')) {
      return true;
    }

    const lowerCaseName = file.name.toLowerCase();
    return accept.some((entry) => {
      const acceptedType = entry.trim().toLowerCase();
      if (acceptedType.startsWith('.')) {
        return lowerCaseName.endsWith(acceptedType);
      }
      if (acceptedType.endsWith('/*')) {
        return file.type.toLowerCase().startsWith(acceptedType.slice(0, -1));
      }
      return file.type.toLowerCase() === acceptedType;
    });
  }

  hasFiles(): boolean {
    return this.files.length > 0
  }

  onRemove($event:File) {
    this.files.splice(this.files.indexOf($event), 1);
  }

  canSubmit = () => this.hasFiles() && this.form.valid;

  onSubmit() {
    if (!this.canSubmit()) {
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

  getIconForFile(file: File): string {
    return getIconForMimeType(file.type);
  }
}
