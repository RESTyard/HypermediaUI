import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ErrorDialogContainerProvider } from './error-dialog/application-root.provider';
import { SettingsService } from './settings/services/settings.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [],
      providers: [
        ErrorDialogContainerProvider,
        SettingsService,
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Hypermedia UI'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Hypermedia UI');
  });
});
