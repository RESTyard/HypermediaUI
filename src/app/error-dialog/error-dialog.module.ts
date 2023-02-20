import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorModalDialogComponent } from './error-modal-dialog/error-modal-dialog.component';
import { ErrorDialogPresenter } from './error-dialog-presenter.service';
import { ErrorDialogContainerProvider } from './application-root.provider';
import { GlobalErrorHandler } from './global-error.handler';
import { ProblemDetailsViewComponent } from './problem-details-view/problem-details-view.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
    NgxJsonViewerModule
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    ErrorDialogPresenter,
    ErrorDialogContainerProvider
  ],
  exports: [
    ProblemDetailsViewComponent
  ],
  declarations: [
    ErrorModalDialogComponent,
    ProblemDetailsViewComponent
  ],
  entryComponents: [ErrorModalDialogComponent]
})
export class ErrorDialogModule { }
