import { Component, OnInit, Input } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { ProblemDetailsError } from '../problem-details-error';

@Component({
    selector: 'app-problem-details-view',
    templateUrl: './problem-details-view.component.html',
    styleUrls: ['./problem-details-view.component.scss'],
    standalone: false
})
export class ProblemDetailsViewComponent implements OnInit {

  @Input() problemDetailsError: ProblemDetailsError | undefined;

  constructor(private clipboardService: ClipboardService) { }

  ngOnInit() {
  }

  copyToClipBoard(event: any) {
    if (this.problemDetailsError) {
      this.clipboardService.copyFromContent(JSON.stringify(this.problemDetailsError.rawObject, null, 4));
    }
    event.stopPropagation()
  }

  getStatusCodeMessage(statusCode: number | undefined): string {
    let message;
    if (!statusCode || statusCode == 0) {
      return "";
    }

    if (statusCode >= 200 && statusCode < 300) {
      message = 'Executed';
    } else if (statusCode === 400) {
      message = 'Bad Request';
    } else if (statusCode === 401) {
      message = 'Unauthorized';
    } else if (statusCode === 403) {
      message = 'Forbidden';
    } else if (statusCode === 404) {
      message = 'Action resource not found';
    } else if (statusCode === 409) {
      message = 'Resource has changed: conflict.';
    } else if (statusCode >= 400 && statusCode < 500) {
      message = 'Client error';
    } else if (statusCode >= 500) {
      message = 'Server error';
    } else if (statusCode === -1) {
      message = 'Client error';
    } else {
      message = 'Unknown';
    }

    return message + ` (${statusCode})`;
  }

}
