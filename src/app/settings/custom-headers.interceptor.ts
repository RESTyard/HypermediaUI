import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {SettingsService} from './services/settings.service';

@Injectable()
export class CustomHeadersInterceptor implements HttpInterceptor {

  constructor(private settingsService: SettingsService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let headers = request.headers;
    this.settingsService.getGlobalHeaders().forEach(h => {
      if (h.Key!== "") {
        headers = headers.set(h.Key, h.Value);
      }
      
    });

    this.settingsService.getHeadersForSite(new URL(request.url).host).forEach(h => {
      if (h.Key!== "") {
        headers = headers.set(h.Key, h.Value);
      }
    });

    return next.handle(request.clone({
      headers: headers
    }));
  }
}
