import { Injectable } from '@angular/core';

@Injectable()
export class HypermediaViewConfiguration {
  showRawTab = true;

  showClasses = false;

  showEmptyEntities = false;

  showEmptyProperties = false;

  showNullProperties = true;

  showEmptyLinks = false;

  showEmptyActions = false;

  useEmbeddingPropertyForActionParameters = true;
}

