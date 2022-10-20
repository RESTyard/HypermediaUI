import { ErrorDialogContainerProvider } from './application-root.provider';
import {
  ComponentRef,
  Injectable,
  Injector,
  ViewContainerRef,
} from '@angular/core';

import { ErrorModalDialogComponent } from './error-modal-dialog/error-modal-dialog.component';
import {ThemePalette} from "@angular/material/core";

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
      private appRootProvider: ErrorDialogContainerProvider,
      private injector: Injector
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

      this.modal.changeDetectorRef.detectChanges();

      this.modal.instance.close.subscribe(() => this.destroy());
    }

    private destroy() {
      this.modal.destroy();
    }

}
