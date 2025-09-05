import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AliasPageComponent } from './alias-page.component';
import { importStore } from '../store/store-module';
import { ValueProvider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

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
            queryParams: of(),
          }
        },
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
