import { TestBed, inject } from '@angular/core/testing';

import { HypermediaClientService } from './hypermedia-client.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ObservableLruCache } from './api-access/observable-lru-cache';
import { SirenDeserializer } from './siren-parser/siren-deserializer';
import { SchemaSimplifier } from './siren-parser/schema-simplifier';
import { importStore } from '../store/store-module';
import { RouterTestingModule } from '@angular/router/testing';
import { GlobalNavigationEvents } from '../global-navigation.events';
import { AuthService } from './auth.service';
import { ProblemDetailsErrorService } from '../error-dialog/problem-details-error.service';
import { ActionType, HttpMethodTypes, HypermediaAction } from './siren-parser/hypermedia-action';
import { MediaTypes } from './MediaTypes';

describe('HypermediaClientService', () => {
  const ignoreActionResult = () => undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        importStore(),
        RouterTestingModule,
      ],
      providers: [
        HypermediaClientService,
        provideHttpClient(),
        provideHttpClientTesting(),
        ObservableLruCache,
        SirenDeserializer,
        SchemaSimplifier,
        GlobalNavigationEvents,
        { provide: AuthService, useValue: { probeSessionOnce: async () => undefined, refreshSession: async () => undefined } },
        { provide: ProblemDetailsErrorService, useValue: {} },
      ]
    });
  });

  it('should be created', inject([HypermediaClientService], (service: HypermediaClientService) => {
    expect(service).toBeTruthy();
  }));

  it('sends files and JSON parameters as separately named multipart parts', inject(
    [HypermediaClientService, HttpTestingController],
    (service: HypermediaClientService, httpTestingController: HttpTestingController) => {
      const action = new HypermediaAction();
      action.actionType = ActionType.FileUpload;
      action.method = HttpMethodTypes.POST;
      action.href = '/upload';
      action.type = MediaTypes.FormData;
      action.fileParameterName = 'UploadFiles';
      action.waheActionParameterName = 'UploadCarImageParameters';
      action.files = [new File(['image'], 'car.png', {type: 'image/png'})];
      action.parameters = {text: 'Front view', flag: true};

      service.executeAction(action, ignoreActionResult);

      const request = httpTestingController.expectOne('/upload');
      const body = request.request.body as FormData;
      expect(body instanceof FormData).toBeTrue();
      expect((body.get('UploadFiles') as File).name).toBe('car.png');
      expect(body.get('UploadCarImageParameters')).toBe('{"text":"Front view","flag":true}');
      expect(request.request.headers.has('Content-Type')).toBeFalse();
      request.flush({});
      httpTestingController.verify();
    },
  ));

  it('keeps file-only multipart actions free of JSON parts', inject(
    [HypermediaClientService, HttpTestingController],
    (service: HypermediaClientService, httpTestingController: HttpTestingController) => {
      const action = new HypermediaAction();
      action.actionType = ActionType.FileUpload;
      action.method = HttpMethodTypes.POST;
      action.href = '/upload';
      action.type = MediaTypes.FormData;
      action.fileParameterName = 'UploadFiles';
      action.files = [new File(['image'], 'car.png', {type: 'image/png'})];

      service.executeAction(action, ignoreActionResult);

      const request = httpTestingController.expectOne('/upload');
      const body = request.request.body as FormData;
      expect((body.get('UploadFiles') as File).name).toBe('car.png');
      expect(body.get('UploadCarImageParameters')).toBeNull();
      request.flush({});
      httpTestingController.verify();
    },
  ));

  it('keeps JSON actions as JSON request bodies', inject(
    [HypermediaClientService, HttpTestingController],
    (service: HypermediaClientService, httpTestingController: HttpTestingController) => {
      const action = new HypermediaAction();
      action.actionType = ActionType.JsonObjectParameters;
      action.method = HttpMethodTypes.POST;
      action.href = '/json-action';
      action.type = MediaTypes.Json;
      action.parameters = {text: 'value', flag: true};

      service.executeAction(action, ignoreActionResult);

      const request = httpTestingController.expectOne('/json-action');
      expect(request.request.body).toEqual({text: 'value', flag: true});
      request.flush({});
      httpTestingController.verify();
    },
  ));
});
