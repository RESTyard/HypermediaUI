import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { Component, OnInit, Input } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  // note: \ need to be escaped by using \\
  private readonly URL_REGEX = "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()!@:%_\\+.~#?&\\/\\/=]*)";

  public urlFormControl: FormControl;

  @Input() apiEntryPoint: string = "";

  constructor(private hypermediaClientService: HypermediaClientService) {
  this.urlFormControl = new FormControl("", [
      Validators.required,
      Validators.pattern(this.URL_REGEX)
    ]);
  }

  ngOnInit() {}

  navigate() {
    this.hypermediaClientService.Navigate(this.urlFormControl.value);
  }

}
