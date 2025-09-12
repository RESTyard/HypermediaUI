import {Component, OnInit} from '@angular/core';
import {AuthService} from "../hypermedia-view/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {AppConfig, ConfiguredEntryPoint} from "../../app.config.service";
import {CurrentEntryPoint} from "../store/entrypoint.reducer";
import {HypermediaClientService} from "../hypermedia-view/hypermedia-client.service";
import {SettingsService} from "../settings/services/settings.service";
import {combineLatest, filter, firstValueFrom} from "rxjs";
import {Failure, isSuccess, Result} from "fnxt/result";
import {redirectToHuiPage} from "../utils/redirect";
import {ApiPath} from "../hypermedia-view/api-path";
import {MatToolbar} from "@angular/material/toolbar";
import {SettingsModule} from "../settings/settings.module";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import {Unit} from "../utils/unit";

@Component({
  selector: 'app-logout-redirect',
  imports: [
    MatIconModule,
    MatToolbar,
    SettingsModule,
    MatCard,
    MatButton,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions
  ],
  templateUrl: './logout-redirect.component.html',
  styleUrl: './logout-redirect.component.scss'
})
export class LogoutRedirectComponent implements OnInit {
  isSuccess: boolean = false;
  errorMessage: string = "";
  title: string = "";
  private configuredEntryPoint: ConfiguredEntryPoint | undefined;

  public static readonly pathUriParameterKey : string = 'path';
  public static readonly entrypointUriParameterKey: string = 'entrypoint_uri';

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ appConfig: AppConfig, currentEntryPoint: CurrentEntryPoint }>,
    private hypermediaClientService: HypermediaClientService,
    private router: Router,
    settingsService: SettingsService) {
    settingsService.LoadCurrentSettings();
  }

  async ngOnInit(): Promise<void> {
    const tuple = await firstValueFrom(
      combineLatest([
        this.store.select(state => state.appConfig.configuredEntryPoints),
        this.activatedRoute.queryParams
      ]).pipe(
        filter(tuple => tuple[0] !== undefined),
      ));
    const [configuredEntryPoints, queryParams] = tuple;
    const path = queryParams[LogoutRedirectComponent.pathUriParameterKey];
    this.configuredEntryPoint = configuredEntryPoints?.find(e => e.alias === path);

    const entryPoint = queryParams[LogoutRedirectComponent.entrypointUriParameterKey];

    this.title = this.configuredEntryPoint?.title ?? "Hypermedia UI";
    let logoutResult: Result<Unit, string> = Failure("No entrypoint");
    if(entryPoint) {
      logoutResult = await this.authService.handleLogoutCallback(entryPoint);
    }

    if (isSuccess(logoutResult)) {
      this.isSuccess = true;
    } else {
      this.isSuccess = false;
      this.errorMessage = logoutResult.value;
    }
  }

  exit() {
    if (this.configuredEntryPoint) {
      redirectToHuiPage(
        this.configuredEntryPoint.title,
        this.configuredEntryPoint.alias,
        new ApiPath([this.configuredEntryPoint.entryPointUri]),
        this.store,
        this.hypermediaClientService,
        {inplace: false})
    } else {
      this.hypermediaClientService.navigateToEntryPoint();
    }
  }
}
