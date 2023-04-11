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
          this.snackBar.open(`Maximum size of ${this.convertBytesToMBReadable(this.maxFileSize)} exceeded. File size = ${this.convertBytesToMBReadable($event.rejectedFiles[0].size)}.`, null, {
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

  convertBytesToMBReadable(bytes): string {
    return (bytes/Math.pow(10, 6)).toFixed(2) + " MB";
  }

  //TODO: Add 'file' to the text in dropzone, fix spacing
  //TODO: Decrease margin between dropzone up and down, spacing between 'upload' and 'add data'
  getFileIconClassByExtension(filename): string {
    const ext = filename.split(".").pop().toLowerCase();
    for (let type in FILE_TYPE_ICON_MAP) {
        if (FILE_TYPE_ICON_MAP[type].includes(ext)) {
          return type;
        }
      }
      return "fa-file-text";
  }

  navigateLocation(location: string) {
    this.hypermediaClientService.Navigate(location);
  }
}

export const FILE_TYPE_ICON_MAP = {
  'fa-file-image': ["jpg", "jpeg", "png", "gif", "bmp", "tif", "tiff", "svg"],
  'fa-file-pdf': ["pdf"],
  'fa-file-word': ["doc", "docx"],
  'fa-file-text': ["txt", "rtf", "csv"],
  'fa-file-audio': ["mp3", "wav", "ogg", "wma", "m4a", "aac"],
  'fa-file-code': [
    "js",
    "html",
    "css",
    "php",
    "xml",
    "py",
    "java",
    "rb",
    "c",
    "cpp",
    "h",
    "hpp", "json", "sql", "pl", "sh", "bash", "bat"
  ],
  'fa-file-archive': ["zip", "rar", "7z", "tar", "gz", "tgz", "bz2"],
  'fa-file-drive': ["gdoc", "gsheet", "gslides"],
  'fa-file-font': ["ttf", "otf", "woff", "woff2"],
  'fa-file-powerpoint': ["ppt", "pptx"],
  'fa-file-alt': ["ini", "conf", "cfg", "prefs"],
  'fa-file-excel': ["xls", "xlsx", "csv"],
  'fa-file-vector': ["ai", "eps", "svg"],
  'fa-file-video': ["mp4", "avi", "wmv", "mov", "flv", "mkv"]
};

