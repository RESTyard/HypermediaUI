import { HypermediaLink } from './siren-parser/hypermedia-link';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponseBase,
  HttpResponse,
  HttpHeaders,
  HttpEvent
} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, BehaviorSubject, map, catchError, Subject, tap } from 'rxjs';


import { SirenDeserializer } from './siren-parser/siren-deserializer';
import { MockResponses } from './mockResponses';
import { ObservableLruCache } from './api-access/observable-lru-cache';
import { SirenClientObject } from './siren-parser/siren-client-object';
import {HypermediaAction, HttpMethodTypes, ContentTypes} from './siren-parser/hypermedia-action';
import { SirenHelpers } from './SirenHelpers';
import { ApiPath } from './api-path';

import { SettingsService } from '../settings/services/settings.service';
import { generate } from 'rxjs/internal/observable/generate';

import { ProblemDetailsError } from '../error-dialog/problem-details-error';

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

  private static sirenMediaType = 'application/vnd.siren+json';
  private static jsonMediaType = 'application/json';
  private static formDataMediaType = 'multipart/form-data';

  constructor(
    private httpClient: HttpClient,
    private schemaCache: ObservableLruCache<object>,
    private sirenDeserializer: SirenDeserializer,
    private router: Router,
    private settingsService: SettingsService) {
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

    this.Navigate(this.apiPath.firstSegment);
  }

  NavigateToApiPath(apiPath: ApiPath) {
    if (!apiPath || !apiPath.hasPath) {
      this.router.navigate(['']);
    }

    this.apiPath = apiPath;
    this.Navigate(this.apiPath.newestSegment);
  }

  get currentApiPath(): ApiPath {
    return this.apiPath;
  }

  Navigate(url: string) {
    this.apiPath.addStep(url);

    const headers = new HttpHeaders().set('Accept', HypermediaClientService.sirenMediaType);

    this.AddBusyRequest();
    this.httpClient
      .get(url, {
        headers: headers
      })
      .pipe(
        tap({
          next: () => this.RemoveBusyRequest(),
          error: () => this.RemoveBusyRequest()
        }))
      .subscribe({
        next: response => {
          this.router.navigate(['hui'], {
            queryParams: {
              apiPath: this.apiPath.fullPath
            }
          });

          const sirenClientObject = this.MapResponse(response);

          this.currentClientObject$.next(sirenClientObject);
          this.currentClientObjectRaw$.next(response);
          this.currentNavPaths$.next(this.apiPath.fullPath);
        },
        error: (err: HttpErrorResponse) => { throw this.MapHttpErrorResponseToProblemDetails(err); }
      });
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
    headers.set('Accept', HypermediaClientService.sirenMediaType);

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
    console.log(body)
    return this.httpClient.request(
      action.method,
      action.href,
      {
        observe: "response",
        headers: headers,
        body: body
      })
      .pipe(
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
    switch (action.expectedContentType){
      case ContentTypes.NONE: {
        break;
      }
      case ContentTypes.FORM_DATA: {
        requestBody = action.formData;
        break;
      }
      case ContentTypes.JSON: {
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

  private MapHttpErrorResponseToProblemDetails(errorResponse: HttpErrorResponse): ProblemDetailsError {
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
    // statuscoe 0 clientside or network error
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
    }
    else {
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
    const hco = this.sirenDeserializer.deserialize(response);
    return hco;
  }
}

export enum ActionResults {
  undefined,
  pending,
  error,
  ok
}
