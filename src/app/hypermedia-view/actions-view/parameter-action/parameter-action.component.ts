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
                v => {
                  const result = (v instanceof Date ? this.formatDate(v) : v);
                  return result;
                },
              ];
              mappedField.validators = { 
                required: (control: AbstractControl) => {
                  if (types.includes('null')) {
                    return true;
                  } else {
                    return control.value !== null && control.value !== undefined;
                  }
                },
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
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  }

  public onActionSubmitted() {
    if (!this.form.valid) {
      console.log('not valid');
      return;
    }
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
}
