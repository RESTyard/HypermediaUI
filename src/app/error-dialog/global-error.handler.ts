import { ErrorDialogPresenter } from './error-dialog-presenter.service';
import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ProblemDetailsError } from './problem-details-error';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorDialog: ErrorDialogPresenter, private zone: NgZone) { }

  handleError(error: any) {
    console.error(error);

    if (error instanceof ProblemDetailsError) {
      this.zone.run(() => this.errorDialog.openProblemDetails(error));
      return;
    }

    let message = 'An error occurred.';
    if (error.message) {
      message = error.message;
    }

    this.zone.run(() => this.errorDialog.open('Uuups!', message, 'warn'));
  }
}
