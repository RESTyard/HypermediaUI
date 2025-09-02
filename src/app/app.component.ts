import { Component, ViewContainerRef } from '@angular/core';
import { ErrorDialogContainerProvider } from './error-dialog/application-root.provider';
import { SettingsService } from './settings/services/settings.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'Hypermedia UI';

  constructor(private applicationRootProvider: ErrorDialogContainerProvider, private viewContainerReference: ViewContainerRef, private SettingsService: SettingsService) {
    // inject settings service so current settings are loaded
    this.applicationRootProvider.pushContainer(this.viewContainerReference);
  }

}
