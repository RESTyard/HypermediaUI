import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorModalDialogComponent } from './error-modal-dialog/error-modal-dialog.component';
import { ErrorDialogPresenter } from './error-dialog-presenter.service';
import { ErrorDialogContainerProvider } from './application-root.provider';
import { GlobalErrorHandler } from './global-error.handler';


@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    ErrorDialogPresenter,
    ErrorDialogContainerProvider
  ],
  declarations: [ErrorModalDialogComponent],
  entryComponents: [ErrorModalDialogComponent]
})
export class ErrorDialogModule { }
