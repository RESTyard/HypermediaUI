import { ErrorDialogPresenter } from './error-dialog-presenter.service';
import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ProblemDetailsError } from './problem-details-error';
import {ProblemDetailsErrorService} from "./problem-details-error.service";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorDialog: ErrorDialogPresenter, private zone: NgZone, private problemDetailsErrorService: ProblemDetailsErrorService) { }

  handleError(error: any) {
    console.error(error);

    if (error instanceof ProblemDetailsError) {
      this.problemDetailsErrorService.showProblemDetailsDialog(error);
      return;
    }

    let message = 'An error occurred.';
    if (error.message) {
      message = error.message;
    }

    this.zone.run(() => this.errorDialog.open('Uuups!', message, 'warn'));
  }
}
