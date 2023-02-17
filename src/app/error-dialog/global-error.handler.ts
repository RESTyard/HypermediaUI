import { ErrorDialogPresenter } from './error-dialog-presenter.service';
import { ErrorHandler, Injectable } from '@angular/core';
import { ProblemDetailsError } from './problem-details-error';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorDialog: ErrorDialogPresenter) { }

  handleError(error: any) {
    console.error(error);

    if (error instanceof ProblemDetailsError) {
      this.errorDialog.openProblemDetails(error);
      return;
    }

    let message = 'An error occurred.';
    if (error.message) {
      message = error.message;
    }

    this.errorDialog.open('Uuups!', message, 'warn');
  }
}
