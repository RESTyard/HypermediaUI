import {Component, Input, OnInit} from '@angular/core';
import {HypermediaAction} from '../../siren-parser/hypermedia-action';
import {NgxDropzoneChangeEvent} from 'ngx-dropzone';
import {ActionResults, HypermediaClientService} from '../../hypermedia-client.service';
import {ProblemDetailsError} from '../../../error-dialog/problem-details-error';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-upload-action',
  templateUrl: './file-upload-action.component.html',
  styleUrls: ['./file-upload-action.component.css']
})
export class FileUploadActionComponent implements OnInit {

  @Input()
  action!: HypermediaAction;
  file: File;

  ActionResultsEnum = ActionResults;
  actionResult: ActionResults = ActionResults.undefined;
  actionResultLocation: string | null = null;
  actionMessage: string = "";
  executed: boolean = false; // TODO show multiple executions as list
  problemDetailsError: ProblemDetailsError| null = null
  maxFileSize: number = +"1e+7";

  constructor(private hypermediaClientService: HypermediaClientService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  onSelect($event: NgxDropzoneChangeEvent) {
    if($event.addedFiles.length > 0){
      this.file = $event.addedFiles[0];
    } else {
      if($event.rejectedFiles.length > 0){
        if($event.rejectedFiles[0].reason == 'size'){
          this.snackBar.open(`Maximum size of ${this.maxFileSize/Math.pow(10, 6)} MB exceeded. File size = ${($event.rejectedFiles[0].size/Math.pow(10, 6)).toFixed(2)} MB.`, null, {
            panelClass: ['error-snackbar']
          });
        }
      }
    }
  }

  onRemove(_: File) {
    this.file = null;
  }

  onSubmit() {
    let formData = new FormData();
    formData.set('upload_file', this.file);
    this.action.formData = formData;
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
}
