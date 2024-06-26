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

  formlyFields: FormlyFieldConfig[] = null;
  form: FormGroup = new FormGroup({});
  model: any;

  constructor(
    private hypermediaClientService: HypermediaClientService,
    private formlyJsonschema: FormlyJsonschema,
  ) {}

  ngOnInit() {
    this.action.waheActionParameterJsonSchema.subscribe((x) => {
      this.formlyFields = [
        this.formlyJsonschema.toFieldConfig(x, {
          map: (mappedField, mapSource) => {
            if (mappedField.key) {
              mappedField.props.label = mappedField.key + '';
            }
            if (
              this.action.defaultValues &&
              this.action.defaultValues.hasOwnProperty(mappedField.key + '')
            ) {
              mappedField.defaultValue =
                this.action.defaultValues[mappedField.key + ''];
            } else {
              let defaultValue = this.recursiveSearch(
                this.action.defaultValues,
                mappedField.key + '',
              );
              if (
                mappedField.defaultValue === undefined &&
                defaultValue !== undefined
              ) {
                mappedField.defaultValue = defaultValue;
              }
            }
            return mappedField;
          },
        }),
      ];
    });
  }

  recursiveSearch(obj, keyToFind) {
    let result;

    function search(obj, keyToFind) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (key === keyToFind) {
            result = obj[key];
            return;
          } else if (typeof obj[key] === 'object') {
            search(obj[key], keyToFind);
            if (result !== undefined) {
              return;
            }
          }
        }
      }
    }

    search(obj, keyToFind);
    return result;
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
