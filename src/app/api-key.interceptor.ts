import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiKeyService} from './api-key.service';

@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {

  constructor(private apiKeyService: ApiKeyService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const apiKey = this.apiKeyService.apiKey;
    return next.handle(apiKey === null ? request : request.clone({
      setHeaders: {
        'x-api-key': apiKey
      }
    }));
  }
}
