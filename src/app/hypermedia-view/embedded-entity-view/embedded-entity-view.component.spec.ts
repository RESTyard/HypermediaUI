import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddedEntityViewComponent } from './embedded-entity-view.component';

describe('EmbeddedEntityViewComponent', () => {
  let component: EmbeddedEntityViewComponent;
  let fixture: ComponentFixture<EmbeddedEntityViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbeddedEntityViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddedEntityViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
