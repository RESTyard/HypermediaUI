import {Injectable} from '@angular/core';
import {HttpInterceptor} from '@angular/common/http';
import {HttpEvent} from '@angular/common/http';
import {HttpRequest} from '@angular/common/http';
import {HttpHandler} from '@angular/common/http';
import {catchError, Observable, of, OperatorFunction, map} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpResponse} from '@angular/common/http';


// WORKAROUND for Angular bug: https://github.com/angular/angular/issues/18680
@Injectable()
export class EmptyResponseBodyErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let handleErrorResponse: OperatorFunction<HttpEvent<any>, HttpEvent<any>> = catchError(
      (err: HttpErrorResponse) => {
        console.log(err)
        if (err.status >= 200 && err.status < 300) {
          const res = new HttpResponse({
            body: null,
            headers: err.headers,
            status: err.status,
            statusText: err.statusText,
            url: err.url || undefined
          });
          // console.log(res)
          return of(res);
        } else {
          throw err;
        }
      }
    );
    let handleEmptyResponse = map(
      (event: HttpResponse<any>) => {
        console.log(event);
        if (event.status > 200 && event.status < 300) {
          const res = new HttpResponse({
            body: null,
            headers: event.headers,
            status: event.status,
            statusText: event.statusText,
            url: event.url || undefined
          });
          // console.log(res)
          return res;
        } else {
          return event;
        }
      }
    );
    let justConsoleLog = map(value => {
      console.log(value);
      return value;
    });
    return next.handle(req)
      .pipe(handleEmptyResponse);
  }
}
