import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HypermediaControlComponent } from './hypermedia-control.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { ActivatedRoute } from '@angular/router';
import { ValueProvider } from '@angular/core';
import { SettingsService } from 'src/app/settings/services/settings.service';
import { of } from 'rxjs';
import { importStore } from 'src/app/store/store-module';

describe('HypermediaControlComponent', () => {
  let component: HypermediaControlComponent;
  let fixture: ComponentFixture<HypermediaControlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        HypermediaControlComponent
      ],
      imports: [
        importStore(),
      ],
      providers: [
        provideHypermediaClientServiceMock(),
        <ValueProvider>{
          provide: ActivatedRoute,
          useValue: {
            queryParams: of(),
          }
        },
        SettingsService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HypermediaControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
