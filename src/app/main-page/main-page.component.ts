import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AppConfig } from 'src/app.config.service';
import { Store } from '@ngrx/store';
import { CurrentEntryPoint } from '../store/entrypoint.reducer';
import { Router } from '@angular/router';
import { redirectToHuiPage } from '../utils/redirect';
import { ApiPath } from '../hypermedia-view/api-path';

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
              const config = appConfig.configuredEntryPoints[0];
              redirectToHuiPage(
                config.title,
                config.alias,
                new ApiPath([config.entryPointUri]),
                this.store,
                this.hypermediaClientService,
                { inplace: true }
              );
            }
          }
        }
      });
    this.urlFormControl = new FormControl("", [
        Validators.required,
        Validators.pattern(this.URL_REGEX)
      ]);
  }

  ngOnInit() { }

  navigate() {
    redirectToHuiPage(
      'Hypermedia UI',
      'hui',
      new ApiPath([this.urlFormControl.value]),
      this.store,
      this.hypermediaClientService,
      { inplace: false}
    )
  }
}
