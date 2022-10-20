import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterActionComponent } from './parameter-action.component';

describe('ParameterActionComponent', () => {
  let component: ParameterActionComponent;
  let fixture: ComponentFixture<ParameterActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ParameterActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
