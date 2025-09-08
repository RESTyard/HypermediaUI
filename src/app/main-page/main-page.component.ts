import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { Component, OnInit, Input } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { AppConfig } from 'src/app.config.service';
import { Store } from '@ngrx/store';
import { CurrentEntryPoint } from '../store/entrypoint.reducer';
import { updateEntryPoint } from '../store/entrypoint.actions';
import { Router } from '@angular/router';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    standalone: false
})
export class MainPageComponent implements OnInit {
  showSettingsIcon: boolean = true;

  // note: \ need to be escaped by using \\
  private readonly URL_REGEX = "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()!@:%_\\+.~#?&\\/\\/=]*)";

  public urlFormControl: FormControl;

  @Input() apiEntryPoint: string = "";

  constructor(
    private hypermediaClientService: HypermediaClientService,
    private store: Store<{ appConfig: AppConfig, currentEntryPoint: CurrentEntryPoint }>,
    router: Router) {
    store
      .select(state => state.appConfig)
      .subscribe({
        next: appConfig => {
          this.showSettingsIcon = !appConfig.disableDeveloperControls;
          if (appConfig.onlyAllowConfiguredEntryPoints && appConfig.configuredEntryPoints !== undefined) {
            if (appConfig.configuredEntryPoints.length > 0) {
              router.navigate([appConfig.configuredEntryPoints[0].alias]);
            }
          }
        }
      });
    this.urlFormControl = new FormControl("", [
        Validators.required,
        Validators.pattern(this.URL_REGEX)
      ]);
  }

  ngOnInit() {}

  navigate() {
    this.store.dispatch(updateEntryPoint({ newEntryPoint: { title: "Hypermedia UI", path: "hui", entryPoint: this.urlFormControl.value }}));
    this.hypermediaClientService.Navigate(this.urlFormControl.value);
  }

}
