import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ObservableLruCache } from '../api-access/observable-lru-cache';
import { MediaTypes } from '../MediaTypes';
import { ActionType } from './hypermedia-action';
import { SchemaSimplifier } from './schema-simplifier';
import { SirenDeserializer } from './siren-deserializer';

describe('SirenDeserializer action fields', () => {
  let deserializer: SirenDeserializer;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ObservableLruCache,
        SchemaSimplifier,
        SirenDeserializer,
      ],
    });
    deserializer = TestBed.inject(SirenDeserializer);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('parses a multipart action with only a file field', () => {
    const action = deserializer.deserializeActions({
      actions: [{
        name: 'UploadImage',
        type: MediaTypes.FormData,
        fields: [{name: 'UploadFiles', type: 'file', accept: '.png,image/*'}],
      }],
    })[0];

    expect(action.actionType).toBe(ActionType.FileUpload);
    expect(action.fileParameterName).toBe('UploadFiles');
    expect(action.waheActionParameterName).toBeUndefined();
    expect(action.FileUploadConfiguration.Accept).toEqual(['.png', 'image/*']);
  });

  it('parses a multipart action with a file and JSON parameter field', () => {
    const schemaUrl = '/schemas/upload-car-image';
    const action = deserializer.deserializeActions({
      actions: [{
        name: 'UploadCarImage',
        type: MediaTypes.FormData,
        fields: [
          {name: 'UploadFiles', type: 'file'},
          {name: 'UploadCarImageParameters', type: MediaTypes.Json, class: [schemaUrl]},
        ],
      }],
    })[0];

    expect(action.actionType).toBe(ActionType.FileUpload);
    expect(action.fileParameterName).toBe('UploadFiles');
    expect(action.waheActionParameterName).toBe('UploadCarImageParameters');
    action.waheActionParameterJsonSchema?.subscribe(schema => expect(schema).toEqual({type: 'object'}));
    const request = httpTestingController.expectOne(schemaUrl);
    request.flush({type: 'object'});
  });

  it('keeps a single JSON parameter field as a JSON action', () => {
    const schemaUrl = '/schemas/parameters';
    const action = deserializer.deserializeActions({
      actions: [{
        name: 'UpdateCar',
        type: MediaTypes.Json,
        fields: [{name: 'UpdateCarParameters', type: MediaTypes.Json, class: [schemaUrl]}],
      }],
    })[0];

    expect(action.actionType).toBe(ActionType.JsonObjectParameters);
    expect(action.waheActionParameterName).toBe('UpdateCarParameters');
    action.waheActionParameterJsonSchema?.subscribe();
    const request = httpTestingController.expectOne(schemaUrl);
    request.flush({type: 'object'});
  });
});
