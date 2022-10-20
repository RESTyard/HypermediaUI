import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterlessActionViewComponent } from './parameterless-action-view.component';

describe('ParameterlessActionViewComponent', () => {
  let component: ParameterlessActionViewComponent;
  let fixture: ComponentFixture<ParameterlessActionViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ParameterlessActionViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterlessActionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
