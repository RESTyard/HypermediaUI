import { Component, OnInit } from '@angular/core';
import {Header} from '../interface/headers';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from '../settings.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css']
})
export class SettingsDialogComponent implements OnInit {

  public headers: Header[];

  headerFormGroups: FormGroup[] = [];

  // headersForm: FormControl = new FormControl('');
  constructor(private formBuilder: FormBuilder, private settingsService: SettingsService, private snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
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
    // this.settingsService.setHeaders(this.headerFormGroups[0].value);
    let headers = {};
    this.headerFormGroups.forEach(x => {
      if(x.get('key').value == '' || x.get('value').value == ''){
        return;
      }
      headers[x.get('key').value] = x.get('value').value
    });
    this.settingsService.setHeaders(headers);
    this.snackBar.open("Headers updated.")
    console.log(this.settingsService.getHeaders());
  }

  addHeader(): void {
    this.headerFormGroups.push(this.formBuilder.group({
      key: new FormControl(''),
      value: new FormControl('')
    }))
  }

  removeHeader(index: number) {
    this.headerFormGroups.splice(index, 1);
  }
}
