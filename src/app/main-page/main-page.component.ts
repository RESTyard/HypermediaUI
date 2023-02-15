import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { Component, OnInit, Input } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {SettingsService} from '../settings/services/settings.service';
import {Observable} from 'rxjs/internal/Observable';
import {startWith} from 'rxjs/internal/operators/startWith';
import {map} from 'rxjs/internal/operators/map';
import {of} from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  private readonly URL_REGEX = /^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;

  public urlFormControl: FormControl;

  @Input() apiEntryPoint: string = "";

  suggestions: string[];
  suggestionsFiltered: string[];

  constructor(private hypermediaClientService: HypermediaClientService, private settingsService: SettingsService) {
    this.urlFormControl = new FormControl(this.apiEntryPoint, [
      Validators.required,
      Validators.pattern(this.URL_REGEX)
    ]);
  }

  ngOnInit() {
    this.initHistory();
  }

  initHistory() {
    this.suggestions = this.settingsService.getEntryPoints().reverse();
    this.suggestionsFiltered = this.suggestions;
  }

  navigate() {
    this.hypermediaClientService.Navigate(this.apiEntryPoint);
  }

  filterSuggestions() {
    this.suggestionsFiltered = this.suggestions.filter(option => option.toLowerCase().includes(this.urlFormControl.value.toLowerCase()));
  }
}
