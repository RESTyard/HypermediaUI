import {Injectable, NgZone} from "@angular/core";
import {ErrorDialogPresenter} from "./error-dialog-presenter.service";
import {ProblemDetailsError} from "./problem-details-error";

@Injectable()
export class ProblemDetailsErrorService {
  constructor(private errorDialog: ErrorDialogPresenter, private zone: NgZone) {
  }

  public showProblemDetailsDialog(error: ProblemDetailsError) {
    this.zone.run(() => this.errorDialog.openProblemDetails(error));
  }

  public showErrorDialog(title: string, message: string) {
    this.zone.run(() => this.errorDialog.open(title, message));
  }
}
