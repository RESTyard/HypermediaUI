import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HypermediaControlComponent } from './hypermedia-control.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { ActivatedRoute } from '@angular/router';
import { ValueProvider } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { importStore } from 'src/app/store/store-module';
import { AuthService } from '../auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import {GlobalNavigationEvents} from "../../global-navigation.events";

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
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatTooltipModule,
      ],
      providers: [
        provideHypermediaClientServiceMock(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of(),
          },
        } as ValueProvider,
        GlobalNavigationEvents,
        { provide: AuthService, useValue: { userName$: new BehaviorSubject(undefined), isAuthenticated$: new BehaviorSubject(false), redirectToLogoutIfSessionSupported: async () => false } },
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
