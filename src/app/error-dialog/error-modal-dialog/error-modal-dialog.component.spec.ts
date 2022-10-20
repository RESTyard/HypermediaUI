import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import { ErrorModalDialogComponent } from './error-modal-dialog.component';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";

describe('ErrorDialogComponent', () => {
  let component: ErrorModalDialogComponent;
  let fixture: ComponentFixture<ErrorModalDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatButtonModule
      ],
      declarations: [
        ErrorModalDialogComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorModalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
