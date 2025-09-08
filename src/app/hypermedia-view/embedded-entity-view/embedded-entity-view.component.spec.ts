import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddedEntityViewComponent } from './embedded-entity-view.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { importStore } from 'src/app/store/store-module';

describe('EmbeddedEntityViewComponent', () => {
  let component: EmbeddedEntityViewComponent;
  let fixture: ComponentFixture<EmbeddedEntityViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        EmbeddedEntityViewComponent
      ],
      imports: [
        importStore(),
      ],
      providers: [
        provideHypermediaClientServiceMock(),
      ],
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
