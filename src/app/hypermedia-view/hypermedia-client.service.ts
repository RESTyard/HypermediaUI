import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Router} from '@angular/router';

import {BehaviorSubject, lastValueFrom, tap, timeout} from 'rxjs';
import * as fileSaver from 'file-saver';

import {SirenDeserializer} from './siren-parser/siren-deserializer';
import {ObservableLruCache} from './api-access/observable-lru-cache';
import {SirenClientObject} from './siren-parser/siren-client-object';
import {ActionType, HypermediaAction} from './siren-parser/hypermedia-action';
import {ApiPath} from './api-path';

import {ProblemDetailsError} from '../error-dialog/problem-details-error';
import {MediaTypes} from "./MediaTypes";
import {AuthService} from './auth.service';
import {isSuccess} from 'fnxt/result';
import {ProblemDetailsErrorService} from "../error-dialog/problem-details-error.service";
import {GlobalNavigationEvents} from '../global-navigation.events';
import {AppSettings, GeneralSettings} from '../settings/app-settings';
import {Store} from '@ngrx/store';
import {AppConfig} from 'src/app.config.service';
import {selectEffectiveGeneralSettings} from '../store/selectors';
import {CurrentEntryPoint} from '../store/entrypoint.reducer';

export interface IHypermediaClientService {
  isBusy$: BehaviorSubject<boolean>;

  getHypermediaObjectStream(): BehaviorSubject<SirenClientObject>;

  getHypermediaObjectRawStream(): BehaviorSubject<object>;

  getContentTypeStream(): BehaviorSubject<string | undefined>;

  getNavPathsStream(): BehaviorSubject<string[]>;

  navigateToEntryPoint(): void;

  NavigateToApiPath(apiPath: ApiPath): void;

  get currentApiPath(): ApiPath;

  Navigate(url: string, options?: { inplace?: boolean, acceptType?: string }): void;

  DownloadAsFile(downloadUrl: string): void;

  navigateToMainPage(): void;

  createHeaders(withContentType: string | null, withAcceptType: string | null): HttpHeaders;

  createWaheStyleActionParameters(action: HypermediaAction): any;

  executeAction(action: HypermediaAction, actionResult: (actionResults: ActionResults, resultLocation: string | null, content: any, problemDetailsError: ProblemDetailsError | null) => void): any;
}

const problemDetailsMimeType = "application/problem+json";

@Injectable()
export class HypermediaClientService implements IHypermediaClientService {
  private httpClient = inject(HttpClient);
  private schemaCache = inject<ObservableLruCache<object>>(ObservableLruCache);
  private sirenDeserializer = inject(SirenDeserializer);
  private router = inject(Router);
  private authService = inject(AuthService);
  private problemDetailsErrorService = inject(ProblemDetailsErrorService);
  private store = inject<Store<{
    appSettings: AppSettings;
    appConfig: AppConfig;
    currentEntryPoint: CurrentEntryPoint;
}>>(Store);

  private currentClientObject$: BehaviorSubject<SirenClientObject> = new BehaviorSubject<SirenClientObject>(new SirenClientObject());
  private currentClientObjectRaw$: BehaviorSubject<object> = new BehaviorSubject<object>({});
  private currentContentType$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  private currentNavPaths$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private apiPath: ApiPath = new ApiPath();
  private path: string | undefined;

  // indicate that a http request is pending
  public isBusy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private busyRequestsCounter = 0;
  private generalSettings: GeneralSettings = new GeneralSettings();

  constructor() {
    const globalNavigationEvents = inject(GlobalNavigationEvents);
    const store = this.store;


    store
      .select(selectEffectiveGeneralSettings)
      .subscribe({
        next: generalSettings => {
          this.generalSettings = generalSettings;
        }
      });
    store
      .select(state => state.currentEntryPoint)
      .subscribe({
        next: entryPoint => this.path = entryPoint.path,
      });

    globalNavigationEvents.onGotoEntryPoint.subscribe({
      next: _ => {
        this.navigateToEntryPoint();
      }
    });

    globalNavigationEvents.onGotoMainPage.subscribe({
      next: _ => {
        this.navigateToMainPage();
      }
    });

    globalNavigationEvents.onGotoPreviousStep.subscribe({
      next: _ => {
        this.navigateToPreviousStep();
      }
    });
  }

  getHypermediaObjectStream(): BehaviorSubject<SirenClientObject> {
    return this.currentClientObject$;
  }

  getHypermediaObjectRawStream(): BehaviorSubject<object> {
    return this.currentClientObjectRaw$;
  }

  getContentTypeStream(): BehaviorSubject<string | undefined> {
    return this.currentContentType$;
  }

  getNavPathsStream(): BehaviorSubject<string[]> {
    return this.currentNavPaths$;
  }

  navigateToEntryPoint() {
    if (!this.apiPath || !this.apiPath.hasPath) {
      this.router.navigate(['']);
    } else {
      this.Navigate(this.apiPath.firstSegment);
    }
  }

  navigateToPreviousStep() {
    if (!this.apiPath || this.apiPath.pathLength < 2) {
      this.navigateToEntryPoint();
    } else {
      this.apiPath.removeLast();
      this.Navigate(this.apiPath.newestSegment);
    }
  }

  NavigateToApiPath(apiPath: ApiPath, options?: { inplace?: boolean, acceptType?: string }) {
    if (!apiPath || !apiPath.hasPath) {
      this.router.navigate([''], { replaceUrl: options?.inplace ?? false });
    }

    this.apiPath = apiPath;
    this.Navigate(this.apiPath.newestSegment, options);
  }

  get currentApiPath(): ApiPath {
    return this.apiPath;
  }

  async Navigate(url: string, options?: { inplace?: boolean, acceptType?: string }) {
    this.apiPath.setCurrentStep(url);

    const acceptHeader = options?.acceptType ?? MediaTypes.Siren;
    const headers = new HttpHeaders().set('Accept', acceptHeader);

    this.AddBusyRequest();
    let response: HttpResponse<any>;
    try {
      response = await lastValueFrom(this.httpClient
        .get(url, {
          headers: headers,
          observe: 'response',
          responseType: 'blob'
        })
        .pipe(
          tap({
            next: () => this.RemoveBusyRequest(),
            error: () => this.RemoveBusyRequest()
          })));
    } catch (err: any) {
      await this.handleNavigateError(url, err);
      return;
    }

    void this.authService.getSession(this.apiPath.firstSegment);
    const contentTypeHeader = response.headers.get('Content-Type');
    const contentType = contentTypeHeader ? contentTypeHeader.split(';')[0].trim() : MediaTypes.Siren;
    this.currentContentType$.next(contentType);

    this.router.navigate(
      ['hui'],
      {
        replaceUrl: options?.inplace ?? false,
        queryParams: {
          apiPath: this.apiPath.fullPath
        },
        browserUrl: this.buildBrowserUrl(this.path, this.apiPath),
      });

    if (response.body) {
      const normalizedContentType = contentType.toLowerCase();
      const isSiren = normalizedContentType === MediaTypes.Siren.toLowerCase();
      const isJson = normalizedContentType === MediaTypes.Json.toLowerCase();
      const isVendorJson = normalizedContentType.startsWith('application/vnd.') && normalizedContentType.endsWith('+json');

      if (isSiren || isJson || isVendorJson) {
        const text = await (response.body as Blob).text();
        let body: any;
        try {
          body = JSON.parse(text);
        } catch (e) {
          console.error('Error parsing JSON body', e);
          this.currentClientObject$.next(new SirenClientObject());
          this.currentClientObjectRaw$.next(response.body);
          this.currentNavPaths$.next(this.apiPath.fullPath);
          return;
        }

        if (isSiren) {
          const sirenClientObject = this.MapResponse(body);
          this.currentClientObject$.next(sirenClientObject);
        } else {
          this.currentClientObject$.next(new SirenClientObject());
        }
        this.currentClientObjectRaw$.next(body);
      } else {
        this.currentClientObject$.next(new SirenClientObject());
        this.currentClientObjectRaw$.next(response.body);
      }
    } else {
      this.currentClientObject$.next(new SirenClientObject());
      this.currentClientObjectRaw$.next({});
    }
    this.currentNavPaths$.next(this.apiPath.fullPath);
  }

  private async handleNavigateError(url: string, err: any) {
    // Handle Blob errors first to ensure 'err.error' is readable JSON.
    // Do not gate on content-type: the server may return application/vnd.siren+json
    // for error responses when that type was requested via Accept.
    if (err instanceof HttpErrorResponse && err.error instanceof Blob) {
      try {
        // Convert the Blob to a string and parse it as JSON
        const text = await err.error.text();
        err = new HttpErrorResponse({
          error: JSON.parse(text),
          headers: err.headers,
          status: err.status,
          statusText: err.statusText,
          url: err.url || undefined
        });
      } catch (e) {
        console.error("Failed to parse error blob", e);
      }
    }

    if (err instanceof SyntaxError) {
      this.problemDetailsErrorService.showErrorDialog(
        "Content Error",
        "Server did not respond with expected content. Error parsing response.");
      return;
    }

    if (!(err instanceof HttpErrorResponse)) {
      throw err;
    }

    switch (err.status) {
      case 401:
        await this.handleAuthenticationChallenge(url, err);
        break;
      default:
        const problemDetailsError = this.MapHttpErrorResponseToProblemDetails(err);
        this.problemDetailsErrorService.showProblemDetailsDialog(problemDetailsError);
        break;
    }
  }

  private async handleAuthenticationChallenge(url: string, err: HttpErrorResponse) {
    const session = await this.authService.getSession(url);
    if (isSuccess(session) && !session.value.isAuthenticated) {
      const redirectUri = window.location.origin + "/" + this.buildBrowserUrl(this.path, this.apiPath);
      this.authService.redirectToLogin(url, redirectUri);
      return;
    }

    const problemDetailsError = this.MapHttpErrorResponseToProblemDetails(err);
    this.problemDetailsErrorService.showProblemDetailsDialog(problemDetailsError);
  }

  buildBrowserUrl(path: string | undefined, apiPath: ApiPath) {
    const usePath = path ?? 'hui';
    const useApiPath = usePath === 'hui' ? apiPath.fullPath : apiPath.fullPath.slice(1);
    if (useApiPath.length === 0) {
      return usePath;
    }
    const queryParams = this.buildApiPathSearchParams(useApiPath, 'apiPath');
    return usePath + '?' + queryParams.toString();
  }

  getBrowserUrl(url: string) {
    const tempPath = new ApiPath(this.currentApiPath.fullPath);
    tempPath.setCurrentStep(url);
    return this.buildBrowserUrl(undefined, tempPath);
  }

  buildApiPathSearchParams(apiPath: string[], variableName: string) {
    const queryParams = new URLSearchParams(apiPath.map(pathSegment => [variableName, pathSegment]));
    return queryParams;
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

        const blob = response.body;
        if (blob) {
          fileSaver.saveAs(blob, fileName)
        }
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

  createHeaders(withContentType: string | null = null, withAcceptType: string | null = null): HttpHeaders {
    let headers = new HttpHeaders();

    if (withContentType) {
      headers = headers.set('Content-Type', withContentType);
    }
    headers = headers.set('Accept', withAcceptType ?? MediaTypes.Siren);

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
        timeout(this.generalSettings.actionExecutionTimeoutMs),
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
        if (this.generalSettings.useEmbeddingPropertyForActionParameters) {
          requestBody = this.createWaheStyleActionParameters(action);
        } else {
          requestBody = action.parameters;
        }
        break;
      }
    }

    // A FormData body must not carry an explicit Content-Type: the browser generates
    // one including the multipart boundary parameter, which the server needs to parse it.
    const contentTypeHeader = requestBody instanceof FormData ? null : action.type;
    const headers = this.createHeaders(contentTypeHeader, action.type)

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
        const formData = new FormData();
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
    if (errorResponse.error instanceof SyntaxError) {
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
      const message = errorResponse.error.message ? ": " + errorResponse.error.message : "";
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
      if (contentType?.includes(problemDetailsMimeType) || contentType?.includes('json')) {
        console.error("API Error:" + JSON.stringify(errorResponse.error, null, 4));
        return Object.assign(new ProblemDetailsError({rawObject: errorResponse.error}), errorResponse.error);
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
    const problemDetailsError: ProblemDetailsError = this.MapHttpErrorResponseToProblemDetails(errorResponse);

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
