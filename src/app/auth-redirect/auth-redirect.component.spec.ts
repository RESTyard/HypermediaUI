import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthRedirectComponent } from './auth-redirect.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { importStore } from '../store/store-module';
import { AuthService } from '../hypermedia-view/auth.service';
import { HypermediaClientService } from '../hypermedia-view/hypermedia-client.service';
import { SettingsService } from '../settings/services/settings.service';

describe('AuthRedirectComponent', () => {
  let component: AuthRedirectComponent;
  let fixture: ComponentFixture<AuthRedirectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuthRedirectComponent],
      imports: [importStore()],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: AuthService, useValue: {} },
        { provide: HypermediaClientService, useValue: {} },
        { provide: SettingsService, useValue: { LoadCurrentSettings: () => {} } },
      ],
    });
    fixture = TestBed.createComponent(AuthRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
