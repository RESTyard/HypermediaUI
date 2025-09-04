import { Component, OnInit, Input } from '@angular/core';
import { ProblemDetailsError } from 'src/app/error-dialog/problem-details-error';
import {
  ActionResults,
  HypermediaClientService,
} from '../../hypermedia-client.service';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
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
            return mappedField;
          },
        }),
      ];
      this.model = this.action.defaultValues;
    });
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
