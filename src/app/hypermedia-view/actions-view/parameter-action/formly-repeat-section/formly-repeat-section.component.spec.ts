import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyRepeatSectionComponent } from './formly-repeat-section.component';

describe('FormlyRepeatSectionComponent', () => {
  let component: FormlyRepeatSectionComponent;
  let fixture: ComponentFixture<FormlyRepeatSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormlyRepeatSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyRepeatSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
