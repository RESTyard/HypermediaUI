import { Component, OnInit, Input } from '@angular/core';
import { ProblemDetailsError } from 'src/app/error-dialog/problem-details-error';
import {
  ActionResults,
  HypermediaClientService,
} from '../../hypermedia-client.service';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { getIconForHttpMethod } from '../../icon-mapping';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../common/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-parameter-action',
    templateUrl: './parameter-action.component.html',
    styleUrls: ['./parameter-action.component.scss'],
    standalone: false
})
export class ParameterActionComponent implements OnInit {
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
  model: any;

  constructor(
    private hypermediaClientService: HypermediaClientService,
    private formlyJsonschema: FormlyJsonschema,
    private dialog: MatDialog
  ) {}

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
                v => (v instanceof Date ? this.formatDate(v) : v),
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

  public onActionSubmitted() {
    if (!this.form.valid) {
      console.log('not valid');
      return;
    }

    if (this.action.isDestructive()) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Confirm Destructive Action',
          message: 'This action is destructive and cannot be undone. Are you sure you want to continue?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.doActionSubmitted();
        }
      });
    } else {
      this.doActionSubmitted();
    }
  }

  private doActionSubmitted() {
    this.action.parameters = this.form.value;
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
