import { HypermediaViewModule } from './hypermedia-view/hypermedia-view.module';
import { HypermediaControlComponent } from './hypermedia-view/hypermedia-control/hypermedia-control.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { ErrorDialogModule } from './error-dialog/error-dialog.module';

import { AppComponent } from './app.component';
import { LinkViewComponent } from './hypermedia-view/link-view/link-view.component';
import { ProblemDetailsViewComponent } from './error-dialog/problem-details-view/problem-details-view.component';
import { EmptyResponseBodyErrorInterceptor } from './HttpInterceptorWorkaround';
import { MainPageComponent } from './main-page/main-page.component';
import {ApiKeyInterceptor} from './api-key.interceptor';

const appRoutes: Routes = [
  {
    path: 'hui',
    component: HypermediaControlComponent
  },
  {
    path: '',
    pathMatch: 'full',
    component: MainPageComponent
  },
  // { path: '**', component: MainPageComponent } // wildcard -> 404
];


@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes
      // ,{ enableTracing: true } // for debugging output
    ),

    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    ClipboardModule,

    ErrorDialogModule,
    HypermediaViewModule,
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: ApiKeyInterceptor,
    multi: true
  }],
  // providers: [{
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: EmptyResponseBodyErrorInterceptor,
  //   multi: true,
  // }],
  bootstrap: [AppComponent]
})
export class AppModule { }
