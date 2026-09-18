import { Component, ViewContainerRef, inject } from '@angular/core';
import { ErrorDialogContainerProvider } from './error-dialog/application-root.provider';
import { SettingsService } from './settings/services/settings.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  private applicationRootProvider = inject(ErrorDialogContainerProvider);
  private viewContainerReference = inject(ViewContainerRef);
  private SettingsService = inject(SettingsService);

  title = 'Hypermedia UI';

  constructor() {
    // inject settings service so current settings are loaded
    this.applicationRootProvider.pushContainer(this.viewContainerReference);
  }

}
