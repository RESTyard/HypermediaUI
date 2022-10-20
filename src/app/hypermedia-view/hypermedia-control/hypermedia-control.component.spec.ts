import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HypermediaControlComponent } from './hypermedia-control.component';

describe('HypermediaControlComponent', () => {
  let component: HypermediaControlComponent;
  let fixture: ComponentFixture<HypermediaControlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HypermediaControlComponent ]
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
