import { ErrorDialogContainerProvider } from './application-root.provider';
import {
  ComponentRef,
  Injectable,
  Injector,
  NgZone,
  ViewContainerRef,
} from '@angular/core';

import { ErrorModalDialogComponent } from './error-modal-dialog/error-modal-dialog.component';
import { ThemePalette } from "@angular/material/core";
import { ProblemDetailsError } from './problem-details-error';
import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';

@Injectable()
export class ErrorDialogPresenter {
  _viewContainer: ViewContainerRef;

  modal: ComponentRef<ErrorModalDialogComponent>;

  set viewContainer(viewContainer: ViewContainerRef) {
    if (!viewContainer) {
      throw new Error('Please implement ViewContainerProvider ' +
        'in your AppComponent');
    }

    this._viewContainer = viewContainer;
  }

  get viewContainer(): ViewContainerRef {
    return this._viewContainer;
  }

  constructor(
    private hypermediaClientService: HypermediaClientService,
    private appRootProvider: ErrorDialogContainerProvider,
    private injector: Injector,
    private zone: NgZone
  ) {
    appRootProvider
      .container()
      .subscribe(viewContainer => this.viewContainer = viewContainer);
  }

  open(title: string, message: string, color: ThemePalette = 'warn') {
    this.modal = this.viewContainer.createComponent(ErrorModalDialogComponent);
    this.modal.instance.title = title;
    this.modal.instance.message = message;
    this.modal.instance.color = color;

    this.HookUpSignals();
  }

  openProblemDetails(problemDetailsError: ProblemDetailsError, color: ThemePalette = 'warn') {
    this.modal = this.viewContainer.createComponent(ErrorModalDialogComponent);
    this.modal.instance.problemDetailsError = problemDetailsError;

    this.HookUpSignals();
  }

  private HookUpSignals() {
    this.modal.changeDetectorRef.detectChanges();

    this.modal.instance.reload.subscribe(
      () => this.destroy()
    );

    this.modal.instance.gotoEntryPoint.subscribe(() => {
      this.destroy();
      this.zone.run(() => this.hypermediaClientService.navigateToEntryPoint());
    });

    this.modal.instance.exitApi.subscribe(() => {
      this.destroy();
      this.zone.run(() => this.hypermediaClientService.navigateToMainPage());
    });
  }

  private destroy() {
    this.modal.destroy();
  }

}
