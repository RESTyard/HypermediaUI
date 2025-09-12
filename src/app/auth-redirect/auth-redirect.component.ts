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
import { AppConfig, ConfiguredEntryPoint } from 'src/app.config.service';
import { combineLatest, filter, firstValueFrom, map } from 'rxjs';
import { Success, Failure, bindAsync, map as resultMap, isSuccess } from 'fnxt/result';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['./auth-redirect.component.css'],
  standalone: false
})
export class AuthRedirectComponent implements OnInit {
  public static readonly pathUriParameterKey: string = 'path';
  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ appConfig: AppConfig, currentEntryPoint: CurrentEntryPoint }>,
    private hypermediaClientService: HypermediaClientService,
    settingsService: SettingsService) {
    settingsService.LoadCurrentSettings();
  }

  async ngOnInit() {
    const parametersResult = await firstValueFrom(
      combineLatest(
        [
          this.store.select(state => state.appConfig.configuredEntryPoints),
          this.activatedRoute.queryParams,
        ])
        .pipe(
          filter(tuple => tuple[0] !== undefined),
          map((tuple) => {
            const [configuredEntryPoints, queryParams] = tuple;
            const apiPath = new ApiPath();
            apiPath.initFromRouterParams(queryParams);
            const path = queryParams[AuthRedirectComponent.pathUriParameterKey];

            if (apiPath.pathLength < 1) {
              return Failure('invalid redirect uri');
            }

            const targetEntryPoint = apiPath.firstSegment;
            const configuredEntryPoint = configuredEntryPoints?.find((v, _) => v.entryPointUri === targetEntryPoint);
            return Success({
              apiPath: apiPath,
              path: path,
              targetEntryPoint: targetEntryPoint,
              configuredEntryPoint: configuredEntryPoint,
            });
          }),
        ));

      const doCallback = bindAsync(async (parameters: {apiPath: ApiPath, path: string, targetEntryPoint: string, configuredEntryPoint: ConfiguredEntryPoint | undefined }) => resultMap(_ => parameters)(await this.authService.handleCallback(parameters.targetEntryPoint)));
      const result = await doCallback(parametersResult);
      if (isSuccess(result)) {
        redirectToHuiPage(
          result.value.configuredEntryPoint?.title ?? 'Hypermedia UI',
          result.value.path,
          result.value.apiPath,
          this.store,
          this.hypermediaClientService,
          { inplace: true })
      } else {
        throw new ProblemDetailsError({
          type: "ApiError",
          title: "API error",
          detail: result.value,
          status: 401,
        });
      }
  }
}
