import { Component, OnInit } from '@angular/core';
import {Header} from '../interface/headers';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from '../settings.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-header-settings-dialog',
  templateUrl: './header-settings-dialog.component.html',
  styleUrls: ['./header-settings-dialog.component.css']
})
export class HeaderSettingsDialogComponent implements OnInit {

  public headers: Header[];

  headerFormGroups: FormGroup[] = [];

  constructor(private formBuilder: FormBuilder, private settingsService: SettingsService, private snackBar: MatSnackBar, private dialogRef: MatDialogRef<any>) {}

  ngOnInit(): void {
    this.dialogRef.updateSize('55%', '60%');
    const headers = this.settingsService.getHeaders();
    headers.forEach(x => {
      this.headerFormGroups.push(this.formBuilder.group({
        key: new FormControl(x.key),
        value: new FormControl(x.value)
      }));
    });
    if(headers.length == 0){
      this.headerFormGroups.push(this.formBuilder.group({
        key: new FormControl(''),
        value: new FormControl('')
      }));
    }
  }

  updateHeaders(): void {
    let headers = {};
    this.headerFormGroups.forEach(x => {
      if(x.get('key').value == '' || x.get('value').value == ''){
        return;
      }
      headers[x.get('key').value] = x.get('value').value;
    });
    this.settingsService.setHeaders(headers);
    this.snackBar.open("Headers updated.");
  }

  addHeader(): void {
    this.headerFormGroups.push(this.formBuilder.group({
      key: new FormControl(''),
      value: new FormControl('')
    }))
  }

  removeHeader(index: number) {
    this.headerFormGroups.splice(index, 1);
    if(this.headerFormGroups.length == 0) {
      this.addHeader();
    }
  }
}
