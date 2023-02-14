import {HypermediaVieConfiguration} from './hypermedia-view-configuration';
import {HypermediaLink} from './siren-parser/hypermedia-link';
import {Injectable} from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponseBase,
  HttpResponse,
  HttpHeaders,
  HttpEvent
} from '@angular/common/http';
import {Router} from '@angular/router';

import {Observable, BehaviorSubject, map} from 'rxjs';


import {SirenDeserializer} from './siren-parser/siren-deserializer';
import {MockResponses} from './mockResponses';
import {ObservableLruCache} from './api-access/observable-lru-cache';
import {SirenClientObject} from './siren-parser/siren-client-object';
import {HypermediaAction, HttpMethodTyes} from './siren-parser/hypermedia-action';
import {SirenHelpers} from './SirenHelpers';
import {ApiPath} from './api-path';
import {SettingsService} from '../settings/services/settings.service';
import {generate} from 'rxjs/internal/observable/generate';

@Injectable()
export class HypermediaClientService {
  private currentClientObject$: BehaviorSubject<SirenClientObject> = new BehaviorSubject<SirenClientObject>(new SirenClientObject());
  private currentClientObjectRaw$: BehaviorSubject<object> = new BehaviorSubject<object>({});
  private currentNavPaths$: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>(new Array<string>());
  private apiPath: ApiPath = new ApiPath();

  private sirenMediaType = 'application/vnd.siren+json';
  private jsonMediaType = 'application/json';

  constructor(private httpClient: HttpClient, private schemaCache: ObservableLruCache<object>, private sirenDeserializer: SirenDeserializer, private router: Router, private hypermediaConfiguration: HypermediaVieConfiguration, private settingsService: SettingsService) {
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

    let headers = new HttpHeaders().set('Accept', this.sirenMediaType);
    headers = this.setHeaders(url, headers);

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

  executeParameterlessAction(action: HypermediaAction, actionResult: (ActionResults, string?) => void): any {
    let headers = new HttpHeaders().set('Accept', this.sirenMediaType);
    headers = this.setHeaders(action.href, headers);

    switch (action.method) {
      case HttpMethodTyes.POST:
        this.httpClient
          .post(action.href, null,{
            headers: headers,
            observe: "response"
          })
          .pipe(
            map((response: HttpResponse<null>) => {
              console.log(response.headers.get("location"));
              return response;
            })
          )
          .subscribe({
            next: response => {
              actionResult(ActionResults.ok, this.getStatusMessage((<HttpResponseBase>response).status));
            },
            error: error => {
              console.log("error");
              actionResult(ActionResults.error, this.getStatusMessage((<HttpResponseBase>error).status)); // TODO process ProblemJson, SirenProblem https://github.com/kevinswiber/siren/issues/5
              // throw new Error('HypermediaClientService: Error in request: ' + (<HttpErrorResponse>error).message);
            },
            complete: () => {
              actionResult(ActionResults.ok);
            }
          }); // TODO on complete reload current entity?
        break;

      default: {
        // TODO implement other methods
        throw Error('Unsupported method used for execution action');
      }

    }
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

  executeAction(action: HypermediaAction, actionResult: (actionResults: ActionResults, resultLocation, content, string?) => void): any {
    let parameters;
    if (this.hypermediaConfiguration.useEmbeddingPropertyForActionParameters) {
      parameters = this.createWaheStyleActionParameters(action);
    } else {
      parameters = action.parameters;
    }

    let headers = new HttpHeaders()
    .set('Content-Type', this.jsonMediaType)
    .set('Accept', this.sirenMediaType);
    headers = this.setHeaders(action.href, headers);

    // todo if action responds with a action resource, process body
    switch (action.method) {
      case HttpMethodTyes.POST:

        this.httpClient
          .post(
            action.href,
            parameters,
            {
              // can not use std http client due to bug: https://github.com/angular/angular/issues/18680
              // 'Location' header will not be contained
              observe: 'response',
              headers: headers
            })
          .subscribe({
            next: (response: HttpResponse<any>) => {
              const location = response.headers.get('Location');
              if (!response.headers || location === null) {
                console.log('No location header was in response for action.');
                actionResult(ActionResults.ok, null, response.body, this.getStatusMessage(response.status));
              }

              actionResult(ActionResults.ok, location, response.body, this.getStatusMessage(response.status));
            },
            error: (errorResponse: HttpErrorResponse) => {
              let errorMessage = '';
              if (errorResponse.error instanceof Error) {
                // A client-side or network error occurred
                console.log('An error occurred:', errorResponse.error.message);
                errorMessage = this.getStatusMessage(-1);
              } else {
                console.log('Server error', errorResponse);
                errorMessage = this.getStatusMessage(errorResponse.status);
              }

              actionResult(ActionResults.error, null, errorResponse.error, errorMessage); // TODO process ProblemJson in body
            }
          });
        break;

      default: {
        // TODO implement other methods
        throw Error('Unsupported method used for execution action');
      }

    }
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

  private setHeaders(url: string, headers: HttpHeaders): HttpHeaders {
    this.settingsService.getHeaders().forEach(x => {
      headers = headers.set(x.key, x.value);
    });
    this.settingsService.getHeaders(new URL(url).host).forEach(x => {
      headers = headers.set(x.key, x.value);
    });
    return headers;
  }
}

export enum ActionResults {
  undefined,
  pending,
  error,
  ok
}
