import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import { ErrorModalDialogComponent } from './error-modal-dialog.component';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

describe('ErrorDialogComponent', () => {
  let component: ErrorModalDialogComponent;
  let fixture: ComponentFixture<ErrorModalDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule
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

  it('should emit navigateBack when back button is clicked', () => {
    spyOn(component.navigateBack, 'emit');
    const nativeElement = fixture.nativeElement;
    const button = nativeElement.querySelectorAll('button')[1]; // The new button is the second one
    button.click();
    expect(component.navigateBack.emit).toHaveBeenCalled();
  });
});
