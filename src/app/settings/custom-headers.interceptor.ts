import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {SettingsService} from './services/settings.service';
import {Header} from './interface/headers';

@Injectable()
export class CustomHeadersInterceptor implements HttpInterceptor {

  constructor(private settingsService: SettingsService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let headers = request.headers;
    this.settingsService.getHeaders().forEach(x => {
      headers = headers.set(x.key, x.value);
    });
    this.settingsService.getHeaders(new URL(request.url).host).forEach(x => {
      headers = headers.set(x.key, x.value);
    });
    return next.handle(request.clone({
      headers: headers
    }));
  }
}
