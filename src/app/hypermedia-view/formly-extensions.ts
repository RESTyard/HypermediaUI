
import {AbstractControl} from '@angular/forms';
import {FormlyExtension, FormlyFieldConfig} from '@ngx-formly/core';
import {FormlyJsonschema} from '@ngx-formly/core/json-schema';

// fix forms with arrays do not allow empty arrays to be submitted (which is not null)
export const allowEmptyArrayExtension: FormlyExtension = {
  postPopulate(field: FormlyFieldConfig) {
    const ctrl = field.formControl;

    if (field.type === 'array' && ctrl) {
      // Because the model is initially empty ([]) and the schema says it's required,
      // the FormControl is born with an error.
      // in that case remove to allow input
      if (ctrl.hasError('required')) {
        ctrl.clearValidators();

        // Update UI so the label/asterisk updates
        if (field.props) {
          field.props.required = false;
        }

        // Refresh validity state
        ctrl.updateValueAndValidity({emitEvent: false});

        console.log(`Successfully bypassed 'required' for ${field.key} to allow empty arrays`);
      }
    }
  }
};

export function createActionFormlyFields(formlyJsonschema: FormlyJsonschema, jsonSchema: object): FormlyFieldConfig[] {
  return [
    formlyJsonschema.toFieldConfig(jsonSchema, {
      map: (mappedField, mapSource) => {
        if (mappedField.key && mappedField.props) {
          mappedField.props.label = mappedField.key + '';
        }
        mappedField.validators ??= {};
        mappedField.validators['required'] = (control: AbstractControl) => (types.includes('null') || (control.value !== null && control.value !== undefined));
        const types = mapSource.type === undefined ? [] : mapSource.type instanceof Array ? mapSource.type : [mapSource.type];
        if (types.includes('string') && mapSource.format === 'date') {
          mappedField.type = 'date';
          mappedField.parsers = [
            value => (value instanceof Date ? formatDate(value) : value),
          ];
        }
        return mappedField;
      },
    }),
  ];
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const padLeft = (num: number) => `${num < 10 ? '0' + num : num}`;
  return `${year}-${padLeft(month)}-${padLeft(day)}`;
}
