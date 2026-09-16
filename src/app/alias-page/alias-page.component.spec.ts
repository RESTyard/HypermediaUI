import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AliasPageComponent } from './alias-page.component';
import { importStore } from '../store/store-module';
import { ErrorHandler, ValueProvider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHypermediaClientServiceMock } from '../test/HypermediaClientServiceMock';
import { GlobalNavigationEvents } from '../global-navigation.events';
import { AppConfigService } from 'src/app.config.service';
import { AuthService } from '../hypermedia-view/auth.service';
import { ProblemDetailsErrorService } from '../error-dialog/problem-details-error.service';
import { ErrorDialogPresenter } from '../error-dialog/error-dialog-presenter.service';
import { ErrorDialogContainerProvider } from '../error-dialog/application-root.provider';
import { SettingsService } from '../settings/services/settings.service';

describe('AliasPageComponent', () => {
  let component: AliasPageComponent;
  let fixture: ComponentFixture<AliasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AliasPageComponent,
        importStore(),
      ],
      providers: [
        <ValueProvider>{
          provide: ActivatedRoute,
          useValue: {
            url: of([]),
            queryParams: of(),
          }
        },
        provideHypermediaClientServiceMock(),
        GlobalNavigationEvents,
        { provide: ErrorHandler, useValue: { handleError: () => {} } },
        { provide: AppConfigService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: ProblemDetailsErrorService, useValue: {} },
        { provide: ErrorDialogPresenter, useValue: {} },
        { provide: ErrorDialogContainerProvider, useValue: { container: () => of() } },
        { provide: SettingsService, useValue: { LoadCurrentSettings: () => {} } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AliasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
