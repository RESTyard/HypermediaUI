import { Component, OnInit } from '@angular/core';
import {Header} from '../interface/headers';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from '../services/settings.service';
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
  siteFormControls: FormControl[] = [];

  sites: string[] = [];
  siteFormControl: FormControl = new FormControl('');

  constructor(private formBuilder: FormBuilder, private settingsService: SettingsService, private snackBar: MatSnackBar, private dialogRef: MatDialogRef<any>) {}

  ngOnInit(): void {
    this.initHeaders();
    this.initSites();
  }

  initHeaders(){
    this.headerFormGroups = [];
    const headers = this.siteFormControl.value === '' ?
      this.settingsService.getHeaders() : this.settingsService.getHeaders(this.siteFormControl.value) ;
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

  saveHeaders(): void {
    let headers = {};
    this.headerFormGroups.forEach(x => {
      if(x.get('key').value.trim() == '' || x.get('value').value.trim() == ''){
        return;
      }
      headers[x.get('key').value] = x.get('value').value;
    });
    if(this.siteFormControl.value === '') {
      this.settingsService.setHeaders(headers);
    } else {
      this.settingsService.setHeaders(headers, this.siteFormControl.value);
    }

    this.snackBar.open("Headers saved.");
  }

  addHeader(): void {
    this.headerFormGroups.push(this.formBuilder.group({
      key: new FormControl(''),
      value: new FormControl('')
    }));
  }

  removeHeader(index: number): void {
    this.headerFormGroups.splice(index, 1);
    if(this.headerFormGroups.length == 0) {
      this.addHeader();
    }
  }

  initSites(){
    this.siteFormControls = [];
    const sites = this.settingsService.getSites();
    this.sites = sites;
    sites.forEach(x => {
      const control = new FormControl(x);
      control.disable();
      this.siteFormControls.push(control);
    });
    if(sites.length == 0){
      this.siteFormControls.push(new FormControl(''));
    }
  }

  saveSites(): void {
    let sites = this.siteFormControls
      .filter(x => x.getRawValue().trim() != '')
      .map(x => x.getRawValue());
    this.settingsService.setSites(sites);
    this.initSites();
    this.initHeaders();
    this.snackBar.open("Sites saved.");
  }

  addSite(): void {
    this.siteFormControls.push(new FormControl(''));
  }

  removeSite(index: number): void {
    this.siteFormControls.splice(index, 1);
    if(this.siteFormControls.length == 0) {
      this.addSite();
    }
  }
}
