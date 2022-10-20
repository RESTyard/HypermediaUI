import { Component, ViewContainerRef } from '@angular/core';
import { ErrorDialogContainerProvider } from './error-dialog/application-root.provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Hypermedia UI';

  constructor(private applicationRootProvider: ErrorDialogContainerProvider, private viewContainerReference: ViewContainerRef) {
    this.applicationRootProvider.pushContainer(this.viewContainerReference);
  }

}
