import {Component} from '@angular/core';
import {AuthService} from '../hypermedia-view/auth.service';
import {Router} from '@angular/router';
import {ProblemDetailsError} from '../error-dialog/problem-details-error';
import {ApiPath} from "../hypermedia-view/api-path";
import {SettingsService} from "../settings/services/settings.service";

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['./auth-redirect.component.css'],
  standalone: false
})
export class AuthRedirectComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    settingsService: SettingsService) {
    settingsService.LoadCurrentSettings();
  }

  ngOnInit() {

    let targetEntryPoint = new URL(window.location.href).searchParams.getAll("api_path");

    if (!targetEntryPoint || targetEntryPoint.length < 1) {
      throw new ProblemDetailsError();
    }

    let apiPath = new ApiPath(targetEntryPoint);

    this.authService.handleCallback(targetEntryPoint[0])
      .then(success => {
        let browserUrl = this.buildBrowserUrl("hui", apiPath);
        return success.match(
          _ => this.router.navigate(['hui'], {
              replaceUrl: true,
              queryParams: {
                apiPath: apiPath.fullPath
              },
              browserUrl: browserUrl
            }
          ),
          error => {
            throw new ProblemDetailsError({
              type: "ApiError",
              title: "API error",
              detail: error,
              status: 401,
            })
          }
        );
      });
  }

  buildBrowserUrl(path: string | undefined, apiPath: ApiPath, variableName: string = 'apiPath') {
    if (path === undefined) {
      path = 'hui';
    }
    const useApiPath = path === 'hui' || path === 'auth-redirect' ? apiPath.fullPath : apiPath.fullPath.slice(1);
    if (useApiPath.length === 0) {
      return path;
    }
    const q = new URLSearchParams(useApiPath.map(pathSegment => [variableName, pathSegment]));
    return path + '?' + q.toString();
  }
}
