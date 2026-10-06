import {TestBed} from '@angular/core/testing';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormlyFieldConfig, FormlyFormBuilder, FormlyModule} from '@ngx-formly/core';
import {FormlyJsonschema} from '@ngx-formly/core/json-schema';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {JSONSchema7} from 'json-schema';
import {createActionFormlyFields, describeInvalidControls} from './formly-extensions';
import {SchemaSimplifier} from './siren-parser/schema-simplifier';

describe('createActionFormlyFields', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          // the app's custom components are not needed to build the form controls
          types: [
            {name: 'null', extends: 'input'},
            {name: 'object', extends: 'formly-group'},
            {name: 'multischema', extends: 'formly-group'},
          ],
        }),
        FormlyMaterialModule,
      ],
    });
  });

  const enumValues = ['Running', 'Stopped'];
  const definitions: JSONSchema7['definitions'] = {
    State: {enum: enumValues},
    TypedState: {type: 'string', enum: enumValues},
  };

  // runs the schema through the same simplification as schemas fetched from the server
  function buildForm(property: JSONSchema7, model: object = {}): {form: FormGroup, field: FormlyFieldConfig} {
    const schema: JSONSchema7 = {type: 'object', properties: {value: property}, definitions: structuredClone(definitions)};
    new SchemaSimplifier().simplifySchema(schema);
    const fields = createActionFormlyFields(TestBed.inject(FormlyJsonschema), schema);
    const form = new FormGroup({});
    TestBed.inject(FormlyFormBuilder).build({form, fieldGroup: fields, model, options: {}});
    return {form, field: fields[0].fieldGroup![0]};
  }

  const optionalCases: [string, JSONSchema7][] = [
    ['nullable type', {type: ['string', 'null']}],
    ['nullable integer', {type: ['integer', 'null']}],
    ['nullable boolean', {type: ['boolean', 'null']}],
    ['nullable date', {type: ['string', 'null'], format: 'date'}],
    ['nullable integer as oneOf', {oneOf: [{type: 'integer', format: 'int32'}, {type: 'null'}]}],
    ['enum containing null without type', {enum: [...enumValues, null]}],
    ['nullable inline enum as oneOf', {oneOf: [{type: 'null'}, {enum: enumValues}]}],
    ['nullable enum reference as oneOf', {oneOf: [{$ref: '#/definitions/State'}, {type: 'null'}]}],
    ['nullable typed enum reference as oneOf', {oneOf: [{$ref: '#/definitions/TypedState'}, {type: 'null'}]}],
    ['nullable type as anyOf', {anyOf: [{type: 'string'}, {type: 'null'}]}],
    ['schema without type', {}],
  ];

  optionalCases.forEach(([name, property]) => {
    it(`accepts an empty value for a ${name}`, () => {
      const {form, field} = buildForm(property);
      expect(form.valid).toBeTrue();
      expect(field.props?.required).toBeFalsy();
    });
  });

  const mandatoryCases: [string, JSONSchema7, unknown][] = [
    ['non nullable type', {type: 'string'}, 'Running'],
    ['integer', {type: 'integer', format: 'int32'}, 0],
    ['boolean', {type: 'boolean'}, false],
    ['enum without null', {enum: enumValues}, 'Running'],
    ['enum reference', {$ref: '#/definitions/State'}, 'Running'],
    ['number or integer as anyOf', {anyOf: [{type: 'number'}, {type: 'integer'}]}, 1],
  ];

  mandatoryCases.forEach(([name, property, value]) => {
    it(`rejects an empty value for a ${name}`, () => {
      const {form, field} = buildForm(property);
      expect(form.valid).toBeFalse();
      expect(field.props?.required).toBeTrue();
    });

    it(`accepts a value for a ${name}`, () => {
      expect(buildForm(property, {value}).form.valid).toBeTrue();
    });
  });
});

describe('describeInvalidControls', () => {
  it('lists the path and failed validators of each invalid control', () => {
    const form = new FormGroup({
      name: new FormControl('set', Validators.required),
      state: new FormControl(null, [Validators.required, Validators.minLength(2)]),
      paging: new FormGroup({size: new FormControl(null, Validators.required)}),
      tags: new FormArray([new FormControl('ok'), new FormControl(null, Validators.required)]),
      ignored: new FormControl({value: null, disabled: true}, Validators.required),
    });

    expect(describeInvalidControls(form)).toEqual(['state (required)', 'paging.size (required)', 'tags.1 (required)']);
  });
});
