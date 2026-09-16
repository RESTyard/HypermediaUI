import { TestBed, inject } from '@angular/core/testing';

import { HypermediaClientService } from './hypermedia-client.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ObservableLruCache } from './api-access/observable-lru-cache';
import { SirenDeserializer } from './siren-parser/siren-deserializer';
import { SchemaSimplifier } from './siren-parser/schema-simplifier';
import { importStore } from '../store/store-module';
import { RouterTestingModule } from '@angular/router/testing';
import { GlobalNavigationEvents } from '../global-navigation.events';
import { AuthService } from './auth.service';
import { ProblemDetailsErrorService } from '../error-dialog/problem-details-error.service';

describe('HypermediaClientService', () => {
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
        { provide: AuthService, useValue: {} },
        { provide: ProblemDetailsErrorService, useValue: {} },
      ]
    });
  });

  it('should be created', inject([HypermediaClientService], (service: HypermediaClientService) => {
    expect(service).toBeTruthy();
  }));
});
