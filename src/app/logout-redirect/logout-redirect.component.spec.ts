import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutRedirectComponent } from './logout-redirect.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { importStore } from '../store/store-module';
import { AuthService } from '../hypermedia-view/auth.service';
import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { SettingsService } from '../settings/services/settings.service';

describe('LogoutRedirectComponent', () => {
  let component: LogoutRedirectComponent;
  let fixture: ComponentFixture<LogoutRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutRedirectComponent, importStore()],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: AuthService, useValue: {} },
        { provide: HypermediaClientService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: SettingsService, useValue: { LoadCurrentSettings: () => {} } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
