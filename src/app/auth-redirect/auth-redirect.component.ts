import {Component, OnInit} from '@angular/core';
import {AuthService} from '../hypermedia-view/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ProblemDetailsError} from '../error-dialog/problem-details-error';
import {ApiPath} from "../hypermedia-view/api-path";
import {SettingsService} from "../settings/services/settings.service";
import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { Store } from '@ngrx/store';
import { CurrentEntryPoint } from '../store/entrypoint.reducer';
import { redirectToHuiPage } from '../utils/redirect';
import { AppConfig } from 'src/app.config.service';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['./auth-redirect.component.css'],
  standalone: false
})
export class AuthRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ appConfig: AppConfig, currentEntryPoint: CurrentEntryPoint }>,
    private hypermediaClientService: HypermediaClientService,
    settingsService: SettingsService) {
    settingsService.LoadCurrentSettings();
  }

  ngOnInit() {
    combineLatest(
      [
        this.store.select(state => state.appConfig.configuredEntryPoints),
        this.activatedRoute.queryParams,
      ])
      .pipe(
        map(tuple => {
          const [configuredEntryPoints, queryParams] = tuple;
          const apiPath = new ApiPath();
          apiPath.initFromRouterParams(queryParams);
          const path = queryParams['path'];

          if (apiPath.pathLength < 1) {
            throw new ProblemDetailsError();
          }

          const targetEntryPoint = apiPath.firstSegment;
          const configuredEntryPoint = configuredEntryPoints?.find((v, _) => v.entryPointUri === targetEntryPoint);
          return {
            apiPath: apiPath,
            path: path,
            targetEntryPoint: targetEntryPoint,
            configuredEntryPoint: configuredEntryPoint,
          }
        }),
      ).subscribe({
        next: async parameters => {
          const success = await this.authService.handleCallback(parameters.targetEntryPoint);
          success.match(
            _ => redirectToHuiPage(
              parameters.configuredEntryPoint?.title ?? 'Hypermedia UI',
              parameters.path,
              parameters.apiPath,
              this.store,
              this.hypermediaClientService,
              { inplace: true }),
            error => {
              throw new ProblemDetailsError({
                type: "ApiError",
                title: "API error",
                detail: error,
                status: 401,
              })
            }
          );
        },
        error: err => {
          if (err instanceof ProblemDetailsError) {
            throw err;
          }
        }
      });
  }
}
