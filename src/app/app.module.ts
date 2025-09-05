import { HypermediaViewModule } from './hypermedia-view/hypermedia-view.module';
import { HypermediaControlComponent } from './hypermedia-view/hypermedia-control/hypermedia-control.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { inject, NgModule, provideAppInitializer } from '@angular/core';
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
import { MainPageComponent } from './main-page/main-page.component';
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS, MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY } from '@angular/material/tooltip';


import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { SettingsModule } from './settings/settings.module';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CustomHeadersInterceptor } from './settings/custom-headers.interceptor';
import { AppConfigService } from 'src/app.config.service';
import { Observable } from 'rxjs';
import { StoreModule } from '@ngrx/store';
import { appSettingsReducer } from './store/appsettings.reducer';
import { appConfigReducer } from './store/appconfig.reducer';

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

export function appConfigInit(appConfigService: AppConfigService): Observable<any> {
  return appConfigService.load();
}

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 600,
  hideDelay: 0,
  touchendHideDelay: 0,
};

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
    SettingsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    ClipboardModule,
    MatDialogModule,
    ErrorDialogModule,
    HypermediaViewModule,
    MatCardModule,
    MatSelectModule,
    MatListModule,
    MatTableModule,
    MatAutocompleteModule,
    StoreModule.forRoot({
      appSettings: appSettingsReducer,
      appConfig: appConfigReducer,
    })
  ],
  providers: [
    provideAppInitializer(() => appConfigInit(inject(AppConfigService))),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHeadersInterceptor,
      multi: true
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: myCustomTooltipDefaults
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
