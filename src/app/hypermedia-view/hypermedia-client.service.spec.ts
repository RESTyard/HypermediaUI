import { TestBed, inject } from '@angular/core/testing';

import { HypermediaClientService } from './hypermedia-client.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ObservableLruCache } from './api-access/observable-lru-cache';
import { SirenDeserializer } from './siren-parser/siren-deserializer';
import { Router } from '@angular/router';
import { SettingsService } from '../settings/services/settings.service';
import { SchemaSimplifier } from './siren-parser/schema-simplifier';
import { importStore } from '../store/store-module';

describe('HypermediaClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        importStore(),
      ],
      providers: [
        HypermediaClientService,
        provideHttpClient(),
        provideHttpClientTesting(),
        ObservableLruCache,
        SirenDeserializer,
        SchemaSimplifier,
        Router,
        SettingsService,
      ]
    });
  });

  it('should be created', inject([HypermediaClientService], (service: HypermediaClientService) => {
    expect(service).toBeTruthy();
  }));
});
