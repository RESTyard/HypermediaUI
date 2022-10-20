import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsViewComponent } from './actions-view.component';

describe('ActionViewComponent', () => {
  let component: ActionsViewComponent;
  let fixture: ComponentFixture<ActionsViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
