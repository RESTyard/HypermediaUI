import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import {SettingsService} from './services/settings.service';
import {BffOriginsService} from '../hypermedia-view/bff-origins.service';

@Injectable()
export class CustomHeadersInterceptor implements HttpInterceptor {
  private settingsService = inject(SettingsService);
  private bffOrigins = inject(BffOriginsService);


  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let headers = request.headers;
    this.settingsService.getGlobalHeaders().forEach(h => {
      if (h.Key!== "") {
        headers = headers.set(h.Key, h.Value);
      }

    });

    if (URL.canParse(request.url)) {
      this.settingsService.getHeadersForSite(new URL(request.url).host).forEach(h => {
        if (h.Key!== "") {
          headers = headers.set(h.Key, h.Value);
        }
      });
    }

    return next.handle(request.clone({
      headers: headers,
      withCredentials: request.withCredentials || this.bffOrigins.has(request.url)
    }));
  }
}
