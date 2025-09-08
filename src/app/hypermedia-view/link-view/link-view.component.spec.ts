import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkViewComponent } from './link-view.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';

describe('LinkViewComponent', () => {
  let component: LinkViewComponent;
  let fixture: ComponentFixture<LinkViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        LinkViewComponent
      ],
      imports: [],
      providers: [
        provideHypermediaClientServiceMock(),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
