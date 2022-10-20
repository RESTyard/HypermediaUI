import { TestBed, inject } from '@angular/core/testing';

import { HypermediaClientService } from './hypermedia-client.service';

describe('HypermediaClientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HypermediaClientService]
    });
  });

  it('should be created', inject([HypermediaClientService], (service: HypermediaClientService) => {
    expect(service).toBeTruthy();
  }));
});
