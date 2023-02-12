import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { Component, OnInit, Input } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {SettingsDialogComponent} from '../settings/settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  private readonly URL_REGEX = /^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;

  public urlFormControl: FormControl;

  @Input() apiEntryPoint: string = "";

  constructor(private hypermediaClientService: HypermediaClientService, public dialog: MatDialog) {

    this.urlFormControl = new FormControl(this.apiEntryPoint, [
      Validators.required,
      Validators.pattern(this.URL_REGEX)
    ]);
  }

  ngOnInit() {
  }

  openSettings(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  navigate() {
    this.hypermediaClientService.Navigate(this.apiEntryPoint);
  }

}
