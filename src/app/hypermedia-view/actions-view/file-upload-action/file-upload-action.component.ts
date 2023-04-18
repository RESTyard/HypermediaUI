import {Component, Input, OnInit} from '@angular/core';
import {HypermediaAction} from '../../siren-parser/hypermedia-action';
import {NgxDropzoneChangeEvent} from 'ngx-dropzone';
import {ActionResults, HypermediaClientService} from '../../hypermedia-client.service';
import {ProblemDetailsError} from '../../../error-dialog/problem-details-error';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-upload-action',
  templateUrl: './file-upload-action.component.html',
  styleUrls: ['./file-upload-action.component.scss']
})
export class FileUploadActionComponent implements OnInit {

  @Input()
  action!: HypermediaAction;
  files: File[] = [];

  ActionResultsEnum = ActionResults;
  actionResult: ActionResults = ActionResults.undefined;
  actionResultLocation: string | null = null;
  actionMessage: string = "";
  executed: boolean = false; // TODO show multiple executions as list
  problemDetailsError: ProblemDetailsError| null = null

  constructor(private hypermediaClientService: HypermediaClientService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  onSelect($event: NgxDropzoneChangeEvent) {
    this.files.push(...$event.addedFiles);

    // show toast message with size violations
    if($event.rejectedFiles.length > 0){
      let rejectedFilesMessage = "";

      const self = this;
      $event.rejectedFiles.forEach((rejectedFile) => {
        if(rejectedFile.reason == 'size') {
          rejectedFilesMessage += `${rejectedFile.name} too big (${self.convertBytesToMBReadable(rejectedFile.size)} > ${self.convertBytesToMBReadable(self.action.FileUploadConfiguration.MaxFileSizeBytes)})\n`;
        } else if (rejectedFile.reason == 'type'){
          rejectedFilesMessage += `${rejectedFile.name} has wrong type. Acceptable: ${self.action.FileUploadConfiguration.getAcceptString()}\n`
        } else if (rejectedFile.reason == 'no_multiple') {
          rejectedFilesMessage += "Only one file is allowed\n"
        } else {
          rejectedFilesMessage += `${rejectedFile.name} rejected for unknown reason\n`
        }
      });

      this.snackBar.open(rejectedFilesMessage, undefined, {
        panelClass: ['error-snackbar']
      });
    }
  }

  hasFiles():boolean {
    return this.files.length >0
  }

  onRemove($event:File) {
    this.files.splice(this.files.indexOf($event), 1);
  }

  onSubmit() {
    if (this.files.length < 1) {
      return;
    }

    this.action.files = this.files;
    this.actionResult= ActionResults.pending;
    this.executed = true;

    this.hypermediaClientService.executeAction(this.action,
      (result: ActionResults,
        resultLocation: string | null,
        content: string,
        problemDetailsError: ProblemDetailsError | null) => {

        this.problemDetailsError = problemDetailsError;
        this.actionResult = result;

        if (problemDetailsError) {
          this.actionMessage = problemDetailsError.title;
        } else {
          this.actionMessage = '';
        }

        // todo handle if it has content AND location
        this.actionResultLocation = resultLocation;
      });

  }

  convertBytesToMBReadable(bytes: any): string {
    return (bytes/Math.pow(10, 6)).toFixed(2) + " MB";
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }
}
