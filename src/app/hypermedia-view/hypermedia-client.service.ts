import { HypermediaVieConfiguration } from './hypermedia-view-configuration';
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

import { Observable, BehaviorSubject, map } from 'rxjs';


import { SirenDeserializer } from './siren-parser/siren-deserializer';
import { MockResponses } from './mockResponses';
import { ObservableLruCache } from './api-access/observable-lru-cache';
import { SirenClientObject } from './siren-parser/siren-client-object';
import { HypermediaAction, HttpMethodTypes } from './siren-parser/hypermedia-action';
import { SirenHelpers } from './SirenHelpers';
import { ApiPath } from './api-path';

@Injectable()
export class HypermediaClientService {
  private currentClientObject$: BehaviorSubject<SirenClientObject> = new BehaviorSubject<SirenClientObject>(new SirenClientObject());
  private currentClientObjectRaw$: BehaviorSubject<object> = new BehaviorSubject<object>({});
  private currentNavPaths$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>(new Array<string>());
  private apiPath: ApiPath = new ApiPath();

  private static sirenMediaType = 'application/vnd.siren+json';
  private static jsonMediaType = 'application/json';

  constructor(private httpClient: HttpClient, private schemaCache: ObservableLruCache<object>, private sirenDeserializer: SirenDeserializer, private router: Router, private hypermediaConfiguration: HypermediaVieConfiguration) {
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

    this.httpClient
      .get(url, {
        headers: headers
      })
      .subscribe(response => {
        this.router.navigate(['hui'], {
          queryParams: {
            apiPath: this.apiPath.fullPath
          }
        });

        const sirenClientObject = this.MapResponse(response);

        this.currentClientObject$.next(sirenClientObject);
        this.currentClientObjectRaw$.next(response);
        this.currentNavPaths$.next(this.apiPath.fullPath);
      });
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

  private OnActionResponse(response: HttpResponse<any>, actionResult: (actionResults: ActionResults, resultLocation: string | null, content: any, statusCodeString: string) => void) {
    const location = response.headers.get('Location');
    if (!response.headers || location === null) {
      console.log('No location header was in response for action.');
      actionResult(ActionResults.ok, null, response.body, this.getStatusMessage(response.status));
    }

    actionResult(ActionResults.ok, location, response.body, this.getStatusMessage(response.status));
  }

  private ExecuteRequest(action: HypermediaAction, headers: any, body: any | null) {
    return this.httpClient.request(
      action.method,
      action.href,
      {
        observe: "response",
        headers: headers,
        body: body
      });
  }

  createWaheStyleActionParameters(action: HypermediaAction): any {
    if (action.parameters === null) {
      throw new Error(`Action requires parameters but got none. ${action}`);
    }

    const parameters = new Array<any>();
    const internalObject = {};
    internalObject[action.waheActionParameterName] = action.parameters;
    parameters.push(internalObject);

    return parameters;
  }

  executeAction(action: HypermediaAction, actionResult: (actionResults: ActionResults, resultLocation: string | null, content: any, statusCodeString: string) => void): any {
    let parameters = null;
    let parameterMediaType = null;
    if (!action.isParameterLess) {
      parameterMediaType = HypermediaClientService.jsonMediaType;

      if (this.hypermediaConfiguration.useEmbeddingPropertyForActionParameters) {
        parameters = this.createWaheStyleActionParameters(action);
      } else {
        parameters = action.parameters;
      }
    }

    const headers = this.createHeaders(parameterMediaType)

    // todo if action responds with a action resource, process body
    this.ExecuteRequest(action, headers, parameters)
      .subscribe({
        next: (response: HttpResponse<any>) => this.OnActionResponse(response, actionResult),
        error: (errorResponse: HttpErrorResponse) => this.HandleActionError(errorResponse, actionResult)
      });
  }

  private HandleActionError(errorResponse: HttpErrorResponse, actionResult: (actionResults: ActionResults, resultLocation: string | null, content: any, statusCodeString: string) => void) {
    let errorMessage = '';
    if (errorResponse.error instanceof Error) {
      // A client-side or network error occurred
      console.log('An error occurred:', errorResponse.error.message);
      errorMessage = this.getStatusMessage(-1);
    } else {
      console.log('Server error', errorResponse);
      errorMessage = this.getStatusMessage(errorResponse.status);
    }

    // TODO process ProblemJson in body, SirenProblem https://github.com/kevinswiber/siren/issues/5
    actionResult(ActionResults.error, null, errorResponse.error, errorMessage);
  }

  getStatusMessage(statusCode: number): any {
    let message;
    if (statusCode >= 200 && statusCode < 300) {
      message = 'Executed';
    } else if (statusCode === 400) {
      message = 'Bad Request';
    } else if (statusCode === 401) {
      message = 'Unauthorized';
    } else if (statusCode === 403) {
      message = 'Forbidden';
    } else if (statusCode === 404) {
      message = 'Action resource not found';
    } else if (statusCode === 409) {
      message = 'Resource has changed: conflict.';
    } else if (statusCode >= 400 && statusCode < 500) {
      message = 'Client error';
    } else if (statusCode >= 500) {
      message = 'Server error';
    } else if (statusCode === -1) {
      message = 'Client error';
    } else {
      message = 'Unknown';
    }

    return message + ' [' + statusCode + ']';
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
