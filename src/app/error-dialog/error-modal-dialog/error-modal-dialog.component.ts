import { Component, EventEmitter, Input, Output } from '@angular/core';
import {ThemePalette} from "@angular/material/core";
import { ProblemDetailsError } from '../problem-details-error';

@Component({
    selector: 'app-error-dialog',
    templateUrl: './error-modal-dialog.component.html',
    styleUrls: ['./error-modal-dialog.component.scss'],
    standalone: false
})
export class ErrorModalDialogComponent {
  @Input() title = 'Error';
  @Input() message = 'Critical Error raiseed';
  @Input() color: ThemePalette = "warn";

  @Input() problemDetailsError: ProblemDetailsError | null = null;

  @Output() reload = new EventEmitter();
  @Output() gotoEntryPoint = new EventEmitter();
  @Output() exitApi = new EventEmitter();

  constructor() {
    this.reload.subscribe(() => location.reload());
  }
}
