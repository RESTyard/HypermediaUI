import { Component, OnInit, Input } from '@angular/core';
import { ProblemDetailsError } from 'src/app/error-dialog/problem-details-error';
import { ActionResults, HypermediaClientService } from '../../hypermedia-client.service';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {Form, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-parameter-action',
  templateUrl: './parameter-action.component.html',
  styleUrls: ['./parameter-action.component.scss']
})
export class ParameterActionComponent implements OnInit {
  @Input()
  action!: HypermediaAction;

  ActionResultsEnum = ActionResults;

  actionResult: ActionResults = ActionResults.undefined;
  actionResultLocation: string | null = null;
  actionMessage: string = "";
  executed: boolean = false; // TODO show multiple executions as list
  problemDetailsError: ProblemDetailsError| null = null

  formlyFields: FormlyFieldConfig[] = null;
  form: FormGroup = new FormGroup({});

  constructor(private hypermediaClientService: HypermediaClientService) { }

  ngOnInit() {
    const defaultValues = this.action.defaultValues;
    this.action.waheActionParameterJsonSchema.subscribe(x => {
      this.formlyFields = this.mapSchemaToFormlyFields(x);
      this.formlyFields.forEach(value => {
        if(defaultValues[value.key.toString()]){
          value['defaultValue'] = defaultValues[value.key.toString()];
        }
        // value.fieldGroup.forEach(x => {
        //   if(x.type == 'repeat' && !value['defaultValue'].hasOwnProperty(x.key.toString())){
        //     value['defaultValue'][x.key.toString()] = [{value: null}];
        //   }
        // });
      });
    });
  }

  public onActionSubmitted() {
    this.action.parameters = this.form.value;
    this.actionResult= ActionResults.pending;
    this.executed = true;

    this.hypermediaClientService.executeAction(this.action,
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
      });
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }

  mapSchemaToFormlyFields(schema: any): FormlyFieldConfig[] {
    console.log('schema', schema)
    const fields: FormlyFieldConfig[] = [];

    if (schema?.properties) {
      for (const prop in schema.properties) {
        if (schema.properties.hasOwnProperty(prop)) {
          const propSchema = schema.properties[prop];

          let field: FormlyFieldConfig = {
            key: prop,
            type: 'input', // set default type
            templateOptions: {
              label: propSchema.title || prop,
              required: propSchema.required
            }
          };
          switch (propSchema.type) {
            case 'object':
              field.type = 'formly-group';
              field.fieldGroup = this.mapSchemaToFormlyFields(propSchema);
              break;
            case 'integer':
            case 'number':
              field.type = 'input';
              field.templateOptions.type = 'number';
              break;
            case 'boolean':
              field.type = 'checkbox';
              break;
            case 'array':
              field.type = 'repeat';
              field.props = {
                addText: 'Add',
                removeText: 'Remove',
                label: prop,
              };
              field.fieldArray = { type: 'input', templateOptions: {
                type: 'text',
                label: 'My Array',
              }};
              if (propSchema.items.type === 'object') {
                field.fieldArray.type = 'formly-group';
                field.fieldArray.fieldGroup = this.mapSchemaToFormlyFields(propSchema.items);
              }
              break;
            default:
              field.type = 'input';
              field.templateOptions.type = propSchema.type;
          }

          if (propSchema.enum) {
            field.type = 'enum';
            field.templateOptions.options = propSchema.enum.map((value, index) => ({
              label: propSchema['x-enumNames'][index] || value,
              value
            }));
          }

          fields.push(field);
        }
      }
    }
    return fields;
  }

}

