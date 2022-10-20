import { Injectable, ViewContainerRef } from '@angular/core';

import { Observable ,  ReplaySubject } from 'rxjs';

@Injectable()
export class ErrorDialogContainerProvider {
  private appRoot = new ReplaySubject<ViewContainerRef>();

  container(): Observable<ViewContainerRef> {
    return this.appRoot.asObservable();
  }

  pushContainer(ref: ViewContainerRef) {
    this.appRoot.next(ref);
  }
}
