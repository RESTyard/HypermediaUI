import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse, } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, lastValueFrom, tap, timeout } from 'rxjs';
import { saveAs } from 'file-saver';

import { SirenDeserializer } from './siren-parser/siren-deserializer';
import { ObservableLruCache } from './api-access/observable-lru-cache';
import { SirenClientObject } from './siren-parser/siren-client-object';
import { ActionType, HypermediaAction } from './siren-parser/hypermedia-action';
import { ApiPath } from './api-path';

import { SettingsService } from '../settings/services/settings.service';

import { ProblemDetailsError } from '../error-dialog/problem-details-error';
import { MediaTypes } from "./MediaTypes";
import { AuthService } from './auth.service';
import { Result } from "../utils/result";

const problemDetailsMimeType = "application/problem+json";

@Injectable()
export class HypermediaClientService {
  private currentClientObject$: BehaviorSubject<SirenClientObject> = new BehaviorSubject<SirenClientObject>(new SirenClientObject());
  private currentClientObjectRaw$: BehaviorSubject<object> = new BehaviorSubject<object>({});
  private currentNavPaths$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>(new Array<string>());
  private apiPath: ApiPath = new ApiPath();

  // indicate that a http request is pending
  public isBusy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private busyRequestsCounter = 0;

  constructor(
    private httpClient: HttpClient,
    private schemaCache: ObservableLruCache<object>,
    private sirenDeserializer: SirenDeserializer,
    private router: Router,
    private settingsService: SettingsService,
    private authService: AuthService) {
  }

  getHypermediaObjectStream(): BehaviorSubject<SirenClientObject> {
    return this.currentClientObject$;
  }

  getHypermediaObjectRawStream(): BehaviorSubject<object> {
    return this.currentClientObjectRaw$;
  }

  getNavPathsStream(): BehaviorSubject<Array<string>> {
    return this.currentNavPaths$;
  }

  navigateToEntryPoint() {
    if (!this.apiPath || !this.apiPath.hasPath) {
      this.router.navigate(['']);
    }

    this.Navigate(this.apiPath.firstSegment)
    .catch(err => {
      throw err;
    });
  }

  NavigateToApiPath(apiPath: ApiPath) {
    if (!apiPath || !apiPath.hasPath) {
      this.router.navigate(['']);
    }

    this.apiPath = apiPath;
    this.Navigate(this.apiPath.newestSegment)
    .catch(err => {
      throw err;
    });
  }

  get currentApiPath(): ApiPath {
    return this.apiPath;
  }

  async Navigate(url: string) {
    this.apiPath.addStep(url);

    // todo use media type of link if exists in siren, maybe check for supported types?
    const headers = new HttpHeaders().set('Accept', MediaTypes.Siren);

    this.AddBusyRequest();
    try {
      var response = await lastValueFrom(this.httpClient
        .get(url, {
          headers: headers,
          observe: 'response',
          // responseType:'blob' // use for generic access
        })
        .pipe(
          tap({
            next: () => this.RemoveBusyRequest(),
            error: () => this.RemoveBusyRequest()
          })));
      this.authService.authSuccessfulWithTokenFor(url);

      this.router.navigate(['hui'], {
        queryParams: {
          apiPath: this.apiPath.fullPath
        }
      });

      const sirenClientObject = this.MapResponse(response.body);

      this.currentClientObject$.next(sirenClientObject);
      this.currentClientObjectRaw$.next(response.body);

    } catch (err: any) {
      if(!(err instanceof HttpErrorResponse)) {
        return;
      }

      if (err.status === 401 && !this.authService.isTokenRecentlyAcquired(url)) {

        // https://learn.microsoft.com/en-us/entra/msal/dotnet/advancewd/extract-authentication-parameters
        const header = err.headers.get('www-authenticate');
        let result = await (
          this.parseWWWAuthenticateHeaderSchemeParams(header, "Bearer")
            .bind(value => {
              let authUri = value.get('authorization_uri')
              return authUri ? Result.ok(authUri!) : Result.error<string>("No authorization uri defined");
            })
            .bindAsync(async authUri =>
              await this.authService.login(
                url,
                authUri!,
                'hui',
                window.location.origin + "/auth-redirect?api_path=" + encodeURIComponent(url),
                'openid profile email offline_access'
              )
            ));
          result.match(
            _ => {
              return;
            },
            error => {
              console.error(error);
              throw this.MapHttpErrorResponseToProblemDetails(err)
            }
          )
      }

      throw this.MapHttpErrorResponseToProblemDetails(err);
    }
  }

  private parseWWWAuthenticateHeaderSchemeParams(header: string | null, authScheme: string): Result<Map<string, string>> {
    if (!header?.startsWith('Bearer')) {
      return Result.error("");
    }

    let kvpAsString = header?.replace(authScheme, "").split(',',) ?? []
    return Result.ok(new Map(kvpAsString.map(v => {
      let keyAndValue = v.split('=');
      return [keyAndValue[0].trim(), keyAndValue[1].substring(1, keyAndValue[1].length - 1).trim()];
    })));
  }

  DownloadAsFile(downloadUrl: string) {
    // this will break for large files
    // consider https://github.com/jimmywarting/StreamSaver.js
    this.httpClient
      .get(downloadUrl, {
        observe: 'response',
        responseType: 'blob'
      })
      .subscribe(response => {
        let fileName = response.headers.get('content-disposition')
          ?.split(';')[1]
          .split('=')[1];
        if (!fileName) {
          console.log('Could not get file name form response. Use default.');
          fileName = "download.dat"
        }

        let blob = response.body;
        saveAs(blob, fileName)
      })
  }

  private AddBusyRequest() {
    this.busyRequestsCounter++;
    this.isBusy$.next(this.busyRequestsCounter != 0);
  }

  private RemoveBusyRequest() {
    this.busyRequestsCounter--;
    this.isBusy$.next(this.busyRequestsCounter != 0);
  }

  navigateToMainPage() {
    this.apiPath.clear();
    this.router.navigate([''], {});
  }

  createHeaders(withContentType: string | null = null): HttpHeaders {
    const headers = new HttpHeaders();

    if (withContentType) {
      headers.set('Content-Type', withContentType);
    }
    headers.set('Accept', MediaTypes.Siren);

    return headers;
  }

  private OnActionResponse(response: HttpResponse<any>, actionResult: (actionResults: ActionResults, resultLocation: string | null, content: any, problemDetailsError: ProblemDetailsError | null) => void) {
    const location = response.headers.get('Location');
    if (!response.headers || location === null) {
      console.log('No location header was in response for action.');
      actionResult(ActionResults.ok, null, response.body, null);
    }

    actionResult(ActionResults.ok, location, response.body, null);
  }

  private ExecuteRequest(action: HypermediaAction, headers: any, body: any | null) {
    this.AddBusyRequest()
    return this.httpClient.request(
      action.method,
      action.href,
      {
        observe: "response",
        headers: headers,
        body: body
      })
      .pipe(
        timeout(this.settingsService.CurrentSettings.GeneralSettings.actionExecutionTimeoutMs),
        tap({
          next: () => this.RemoveBusyRequest(),
          error: () => this.RemoveBusyRequest()
        }
        ));
  }

  createWaheStyleActionParameters(action: HypermediaAction): any {
    if (action.parameters === null) {
      throw new Error(`Action requires parameters but got none. ${action}`);
    }

    const parameters = new Array<any>();
    const internalObject: any = {};
    internalObject[action.waheActionParameterName!] = action.parameters;
    parameters.push(internalObject);

    return parameters;
  }

  executeAction(action: HypermediaAction, actionResult: (actionResults: ActionResults, resultLocation: string | null, content: any, problemDetailsError: ProblemDetailsError | null) => void): any {
    let requestBody = null;

    switch (action.actionType) {
      case ActionType.NoParameters: {
        break;
      }
      case ActionType.FileUpload: {
        requestBody = this.BuildBodyForFileUpload(action)

        break;
      }
      case ActionType.JsonObjectParameters: {
        if (this.settingsService.CurrentSettings.GeneralSettings.useEmbeddingPropertyForActionParameters) {
          requestBody = this.createWaheStyleActionParameters(action);
        } else {
          requestBody = action.parameters;
        }
        break;
      }
    }

    const headers = this.createHeaders(action.type)

    // todo if action responds with a action resource, process body
    this.ExecuteRequest(action, headers, requestBody)
      .subscribe({
        next: (response: HttpResponse<any>) => this.OnActionResponse(response, actionResult),
        error: (errorResponse: HttpErrorResponse) => this.HandleActionError(errorResponse, actionResult)
      });
  }

  private BuildBodyForFileUpload(action: HypermediaAction): any {
    if (action.files.length < 1) {
      throw new Error(`Can not execute file upload. No file specified`)
    }

    switch (action.type) {

      case MediaTypes.FormData:
        let formData = new FormData();
        action.files.forEach((file) => {
          formData.append('files', file);
        });
        return formData;
      case MediaTypes.OctetStream:
        if (action.files.length > 1) {
          throw new Error(`Can not execute file upload as ${MediaTypes.OctetStream} wit multiple files.`)
        }
        return action.files[0];
      default:
        throw new Error(`Can not execute file upload for encoding type: ${action.type}`)
    }
  }

  private MapHttpErrorResponseToProblemDetails(errorResponse: HttpErrorResponse): ProblemDetailsError {
    if (errorResponse.error && errorResponse.error.error instanceof SyntaxError) {
      // we did not receive a json
      console.error('Content error:', errorResponse.error.message);
      return new ProblemDetailsError({
        type: "Client.ContentError",
        title: "Content error",
        detail: "Server did not respond with expected content (json)",
        status: 406,
      });
    }

    if (errorResponse.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('Client-side error occurred:', errorResponse.error.message);
      return new ProblemDetailsError({
        type: "Client.RequestError",
        title: "Client error on request",
        detail: "Could not execute request.",
        status: 0,
      });
    }

    // https://stackoverflow.com/questions/54922985/getting-status-code-0-angular-httpclient
    // status code 0 clientside or network error
    if (errorResponse.status === 0) {
      let message = errorResponse.error.message ? ": " + errorResponse.error.message : "";
      console.error(`Client-side error occurred ${message}`, errorResponse.error);
      return new ProblemDetailsError({
        type: "Client.RequestError",
        title: "Client error on request",
        detail: 'Could not execute request. Check if the API is reachable and CORS settings.',
        status: 0,
      });
    }

    // try parse problem details
    if (errorResponse.headers) {
      const contentType = errorResponse.headers.get('Content-Type')
      if (contentType?.includes(problemDetailsMimeType)) {
        console.error("API Error:" + JSON.stringify(errorResponse.error, null, 4));
        return Object.assign(new ProblemDetailsError({ rawObject: errorResponse.error }), errorResponse.error);
      }
    }

    // generic error
    let rawBody = null;
    if (errorResponse.error) {
      rawBody = JSON.stringify(errorResponse.error, null, 4);
      console.error(`API Error ${errorResponse.status}: ${rawBody}`);
    } else {
      console.error(`API Error ${errorResponse.status}:`, errorResponse);
    }

    return new ProblemDetailsError({
      type: "ApiError",
      title: "API error",
      detail: "API returned a generic error.",
      status: errorResponse.status,
      rawObject: rawBody
    });
  }

  private HandleActionError(errorResponse: HttpErrorResponse, actionResult: (actionResults: ActionResults, resultLocation: string | null, content: any, problemDetailsError: ProblemDetailsError) => void) {
    let problemDetailsError: ProblemDetailsError = this.MapHttpErrorResponseToProblemDetails(errorResponse);

    actionResult(ActionResults.error, null, null, problemDetailsError);
  }

  private MapResponse(response: any): SirenClientObject {
    return this.sirenDeserializer.deserialize(response);
  }
}

export enum ActionResults {
  undefined,
  pending,
  error,
  ok
}
