
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {FormlyExtension, FormlyFieldConfig} from '@ngx-formly/core';
import {FormlyJsonschema} from '@ngx-formly/core/json-schema';
import {JSONSchema7} from 'json-schema';

// fix forms with arrays do not allow empty arrays to be submitted (which is not null)
export const allowEmptyArrayExtension: FormlyExtension = {
  // before formly evaluates expressions and adds validators, so the form is valid from the start
  prePopulate(field: FormlyFieldConfig) {
    if (field.type !== 'array') {
      return;
    }
    // formly derives props.required from the schema's required list, and its required validator rejects []
    delete field.expressions?.['props.required'];
    if (field.props) {
      field.props.required = false;
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
        const types = schemaTypes(mapSource);
        const allowsNull = isUntyped(mapSource) || isNullable(mapSource) || hasNullableBranch(mapSource);
        const isArray = mappedField.type === 'array';
        mappedField.validators ??= {};
        // a FormArray's value is always an array, only the model tells an unset array from an empty one
        mappedField.validators['required'] = (control: AbstractControl, field: FormlyFieldConfig) =>
          allowsNull || isSet(isArray ? field.model : control.value);
        if (isArray && mappedField.props) {
          // the array type shows the asterisk and null state itself, see ArrayTypeComponent
          mappedField.props['nullable'] = allowsNull;
        }
        if (isArray && mapSource.default === undefined) {
          // formly defaults arrays in the required list to [], but without a default value from the server they are not set
          delete mappedField.defaultValue;
        }
        // shows the asterisk, formly only sets it for properties in the schema's required list
        // not for arrays: required would reject an empty array, which is a valid value
        if (!allowsNull && !isArray && mappedField.key !== undefined && mappedField.props) {
          mappedField.props.required = true;
        }
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

// the form value, except that arrays the user never set are null instead of the FormArray's empty array
export function actionParameterValue(form: FormGroup, fields: FormlyFieldConfig[]): Record<string, unknown> {
  const value = structuredClone(form.value);
  replaceUnsetArrays(fields, value);
  return value;
}

function replaceUnsetArrays(fields: FormlyFieldConfig[] | undefined, value: unknown) {
  if (value === null || typeof value !== 'object') {
    return;
  }
  const values = value as Record<string, unknown>;
  for (const field of fields ?? []) {
    if (field.key === undefined || field.key === null) {
      // e.g. the root object or a oneOf wrapper, which share the value of their parent
      replaceUnsetArrays(field.fieldGroup, value);
      continue;
    }
    const key = String(field.key);
    if (!(key in values)) {
      continue;
    }
    if (field.type === 'array' && !isSet(field.model)) {
      values[key] = null;
    } else {
      replaceUnsetArrays(field.fieldGroup, values[key]);
    }
  }
}

function isSet(value: unknown): boolean {
  return value !== null && value !== undefined;
}

// e.g. ["DeploymentState (enum)", "Paging.PageSize (required)"], to tell the user why a form cannot be submitted
export function describeInvalidControls(control: AbstractControl, path = ''): string[] {
  const own = control.errors ? [`${path || 'form'} (${Object.keys(control.errors).join(', ')})`] : [];
  const children = control instanceof FormGroup || control instanceof FormArray
    ? Object.entries<AbstractControl>(control.controls)
      .filter(([, child]) => child.enabled)
      .flatMap(([key, child]) => describeInvalidControls(child, path ? `${path}.${key}` : key))
    : [];
  return [...own, ...children];
}

function schemaTypes(schema: JSONSchema7): string[] {
  return schema.type === undefined ? [] : schema.type instanceof Array ? schema.type : [schema.type];
}

function isNullable(schema: JSONSchema7): boolean {
  return schemaTypes(schema).includes('null') || !!schema.enum?.includes(null);
}

// the simplifier types anyOf wrappers as object, so their own type does not tell
function hasNullableBranch(schema: JSONSchema7): boolean {
  return [...(schema.oneOf ?? []), ...(schema.anyOf ?? [])].some(branch => typeof branch === 'object' && isNullable(branch));
}

// no type info, e.g. {}
function isUntyped(schema: JSONSchema7): boolean {
  return schema.type === undefined && schema.enum === undefined && schema.const === undefined;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const padLeft = (num: number) => `${num < 10 ? '0' + num : num}`;
  return `${year}-${padLeft(month)}-${padLeft(day)}`;
}
